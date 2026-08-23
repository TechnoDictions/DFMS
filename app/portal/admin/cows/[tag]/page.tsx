'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Livestock, VaccinationTask } from '../../../../../db/db';
import { ArrowLeft, Syringe, Clock, Activity, Edit2, Plus, X, Upload, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

export default function CowProfile() {
  const params = useParams();
  const tag = params.tag as string;

  const [isEditing, setIsEditing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [graphFilter, setGraphFilter] = useState<'Today' | 'Week' | 'Month' | 'Year'>('Week');
  
  const [editCow, setEditCow] = useState<Partial<Livestock>>({});
  const [newTask, setNewTask] = useState<Partial<VaccinationTask>>({ type: '', date: '', status: 'pending' });
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<VaccinationTask | null>(null);
  const [isReschedulingTask, setIsReschedulingTask] = useState(false);
  const [rescheduledDate, setRescheduledDate] = useState('');
  const [rescheduledType, setRescheduledType] = useState('');

  const cow = useLiveQuery(() => db.Livestock.where('tag').equals(tag).first(), [tag]);
  const rawMilkingLogs = useLiveQuery(() => db.MilkingLogs.where('tag').equals(tag).toArray(), [tag]);
  const tasks = useLiveQuery(() => db.VaccinationTasks.where('tag').equals(tag).toArray(), [tag]);

  const chartData = useMemo(() => {
    if (!rawMilkingLogs) return [];
    
    const now = new Date();
    let cutoff = new Date(0); // Year by default (meaning all, or 365 days)
    
    if (graphFilter === 'Today') {
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (graphFilter === 'Week') {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (graphFilter === 'Month') {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (graphFilter === 'Year') {
      cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    const filteredLogs = rawMilkingLogs.filter(log => new Date(log.timestamp) >= cutoff);
    const sortedLogs = filteredLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    return sortedLogs.map((log) => {
      const d = new Date(log.timestamp);
      const isDry = log.yieldLiters === 0;
      return {
        date: graphFilter === 'Today' ? `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}` : `${d.getDate()}/${d.getMonth()+1}`,
        yield: log.yieldLiters,
        timestamp: new Date(log.timestamp).getTime(),
        status: isDry ? 'Dry' : 'Lactating',
      };
    });
  }, [rawMilkingLogs, graphFilter]);

  const referenceAreas = useMemo(() => {
    const areas: {start: string, end: string, status: string}[] = [];
    if (chartData.length === 0) return areas;
    
    let currentPhase = chartData[0].status;
    let startIdx = 0;

    for (let i = 1; i < chartData.length; i++) {
      if (chartData[i].status !== currentPhase) {
        areas.push({
          start: chartData[startIdx].date,
          end: chartData[i-1].date,
          status: currentPhase
        });
        currentPhase = chartData[i].status;
        startIdx = i;
      }
    }
    areas.push({
      start: chartData[startIdx].date,
      end: chartData[chartData.length - 1].date,
      status: currentPhase
    });

    return areas;
  }, [chartData]);

  const handleEditOpen = () => {
    if (cow) {
      setEditCow({ ...cow });
      setIsEditing(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditCow({ ...editCow, picture_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cow && cow.id) {
      
      // Calculate expected calving date if pregnant and start date provided
      let expectedCalvingDate = editCow.expectedCalvingDate;
      if (editCow.status === 'Pregnant' && editCow.pregnancyStartDate) {
        const start = new Date(editCow.pregnancyStartDate);
        // Average gestation is ~283 days
        const expected = new Date(start.getTime() + 283 * 24 * 60 * 60 * 1000);
        expectedCalvingDate = expected.toISOString().split('T')[0];
      }

      await db.Livestock.update(cow.id, {
        name: editCow.name,
        gender: editCow.gender,
        breed: editCow.breed,
        status: editCow.status,
        birthDate: editCow.birthDate,
        picture_url: editCow.picture_url,
        noOfCalves: editCow.gender === 'Female' ? editCow.noOfCalves : 0,
        motherTag: editCow.motherTag || undefined,
        fatherTag: editCow.fatherTag || undefined,
        pregnancyStartDate: editCow.status === 'Pregnant' ? editCow.pregnancyStartDate : undefined,
        expectedCalvingDate: editCow.status === 'Pregnant' ? expectedCalvingDate : undefined,
        upcomingCalfBreed: editCow.status === 'Pregnant' ? editCow.upcomingCalfBreed : undefined,
      });
      setIsEditing(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.type && newTask.date) {
      await db.VaccinationTasks.add({
        tag: tag,
        herdWide: false,
        type: newTask.type,
        date: newTask.date,
        status: 'pending',
        isSynced: false
      });
      setIsScheduling(false);
      setNewTask({ type: '', date: '', status: 'pending' });
    }
  };

  const handleCompleteTask = async () => {
    if (selectedTaskForEdit && selectedTaskForEdit.id) {
      await db.VaccinationTasks.update(selectedTaskForEdit.id, { status: 'completed' });
      setSelectedTaskForEdit(null);
      setIsReschedulingTask(false);
    }
  };

  const handleReschedule = async () => {
    if (selectedTaskForEdit && selectedTaskForEdit.id && rescheduledDate) {
      await db.VaccinationTasks.update(selectedTaskForEdit.id, {
        date: rescheduledDate,
        type: rescheduledType || selectedTaskForEdit.type
      });
      setSelectedTaskForEdit({
        ...selectedTaskForEdit,
        date: rescheduledDate,
        type: rescheduledType || selectedTaskForEdit.type
      });
      setIsReschedulingTask(false);
    }
  };

  if (!cow) {
    return <div className="p-8 text-center text-lg font-bold text-[var(--text-muted)] animate-pulse">Loading Profile...</div>;
  }

  const age = cow.birthDate ? `${Math.abs(new Date(Date.now() - new Date(cow.birthDate).getTime()).getUTCFullYear() - 1970)} yrs` : 'Unknown';

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.yield === 0) {
      return <circle cx={cx} cy={cy} r={5} stroke="var(--border)" strokeWidth={2} fill="#9ca3af" />;
    }
    return <circle cx={cx} cy={cy} r={5} stroke="white" strokeWidth={2} fill="var(--primary)" />;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/portal/admin/cows" className="p-2 rounded-xl hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-main)]">Livestock Profile</h1>
            <p className="text-[var(--text-muted)] font-medium mt-1">Detailed medical and yield history</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border)] luxury-shadow flex flex-col items-center relative">
          <button onClick={handleEditOpen} className="absolute top-6 right-6 p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-full transition-colors">
            <Edit2 className="w-5 h-5" />
          </button>

          <div className="w-40 h-40 rounded-full bg-[var(--accent-light)] flex items-center justify-center text-7xl shadow-md border-4 border-white mb-6 overflow-hidden">
             {cow.picture_url ? <img src={cow.picture_url} className="w-full h-full object-cover" /> : '🐄'}
          </div>
          <h2 className="text-3xl font-black text-[var(--text-main)]">{cow.name}</h2>
          <span className="bg-gray-100 text-gray-800 text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mt-2 mb-8">{cow.tag}</span>

          <div className="w-full space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Status</span>
              <span className={`font-bold ${cow.status.toLowerCase() === 'lactating' ? 'text-green-600' : cow.status.toLowerCase() === 'dry' || cow.status.toLowerCase() === 'colostrum' ? 'text-gray-500' : cow.status.toLowerCase() === 'pregnant' ? 'text-blue-600' : 'text-[var(--text-main)]'}`}>{cow.status}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Breed</span>
              <span className="font-bold text-[var(--text-main)]">{cow.breed}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Gender</span>
              <span className="font-bold text-[var(--text-main)]">{cow.gender || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Age</span>
              <span className="font-bold text-[var(--text-main)]">{age}</span>
            </div>
            {cow.gender === 'Female' && (
              <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Calves</span>
                <span className="font-bold text-[var(--text-main)]">{cow.noOfCalves || 0}</span>
              </div>
            )}
            {(cow.motherTag || cow.fatherTag) && (
              <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Pedigree</span>
                <span className="text-xs font-bold text-[var(--text-main)] text-right">
                  {cow.motherTag ? `Dam: ${cow.motherTag}` : ''}{cow.motherTag && cow.fatherTag ? ' • ' : ''}{cow.fatherTag ? `Sire: ${cow.fatherTag}` : ''}
                </span>
              </div>
            )}
            {cow.status === 'Sold' && (
              <div className="py-3 border-b border-amber-200 bg-amber-50 -mx-4 px-4 rounded-xl space-y-1">
                <span className="text-xs font-black text-amber-900 uppercase tracking-wider block">Sold Animal</span>
                <div className="text-xs font-bold text-amber-950">Sale Price: ₨ {(cow.salePricePKR || 0).toLocaleString()}</div>
                <div className="text-[11px] text-amber-800">Date: {cow.soldDate ? new Date(cow.soldDate).toLocaleDateString() : '-'}</div>
                <div className="text-[11px] text-amber-800">Buyer: {cow.soldTo || '-'}</div>
                <div className="text-[11px] text-amber-800 italic">Condition: &quot;{cow.soldReasonOrCondition || 'Sold'}&quot;</div>
              </div>
            )}
            {cow.status === 'Pregnant' && cow.expectedCalvingDate && (
              <div className="flex justify-between items-center py-3 border-b border-[var(--border)] bg-blue-50/50 -mx-4 px-4 rounded-xl">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Expected Calving</span>
                <span className="font-bold text-blue-900">{new Date(cow.expectedCalvingDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Milking Chart */}
        <div className="lg:col-span-2 space-y-6">
          {cow.gender === 'Male' ? (
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] luxury-shadow flex flex-col items-center justify-center min-h-[400px]">
              <Activity className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-[var(--text-main)]">Milking Not Applicable</h3>
              <p className="text-[var(--text-muted)] font-medium mt-2">This livestock is marked as Male.</p>
            </div>
          ) : (
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] luxury-shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[var(--primary)]" />
                  Milking History
                </h3>
                
                <div className="flex gap-2">
                  {['Today', 'Week', 'Month', 'Year'].map(filter => (
                    <button 
                      key={filter} 
                      onClick={() => setGraphFilter(filter as any)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${graphFilter === filter ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 text-[var(--text-muted)] hover:bg-gray-200'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              
              {chartData.length > 0 ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} horizontal={false} />
                      {referenceAreas.map((area, idx) => (
                        <ReferenceArea 
                          key={idx} 
                          x1={area.start} 
                          x2={area.end} 
                          fill={area.status === 'Lactating' ? 'rgba(30, 58, 43, 0.03)' : 'rgba(100, 116, 139, 0.05)'} 
                        />
                      ))}
                      <XAxis dataKey="date" axisLine={{ stroke: '#E8E2D2' }} tickLine={false} tick={{ fill: '#6C7A73', fontSize: 12, fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={false} dx={-10} />
                      <Tooltip 
                        cursor={{ stroke: 'var(--primary)', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                        formatter={(value: any) => [`${value} Liters`, 'Milk Yield']}
                        contentStyle={{ borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 25px -5px rgba(30, 58, 43, 0.1)', fontWeight: 'bold' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="yield" 
                        stroke="var(--primary)" 
                        strokeWidth={3}
                        dot={<CustomDot />}
                        activeDot={{ r: 7, strokeWidth: 2, stroke: 'white', fill: 'var(--primary)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 w-full flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-2xl">
                  <p className="text-[var(--text-muted)] font-medium">No milking data recorded yet.</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] luxury-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                <Syringe className="w-5 h-5 text-red-500" />
                Medical & Vaccination History
              </h3>
              <button onClick={() => setIsScheduling(true)} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors text-sm border border-red-100">
                <Plus className="w-4 h-4" /> Schedule
              </button>
            </div>
            
            <div className="space-y-4">
              {tasks && tasks.length > 0 ? (
                tasks.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => {
                      setSelectedTaskForEdit(task);
                      setRescheduledDate(task.date);
                      setRescheduledType(task.type);
                      setIsReschedulingTask(false);
                    }}
                    className="flex items-center justify-between p-4 bg-[var(--bg-main)] hover:bg-gray-100/70 rounded-2xl border border-[var(--border)] cursor-pointer transition-colors group"
                  >
                    <div>
                      <h4 className="font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">{task.type}</h4>
                      <p className="text-xs font-medium text-[var(--text-muted)] mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(task.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      task.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--text-muted)] text-center py-4">No medical records found for this animal.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl p-8 max-w-2xl w-full border border-[var(--border)] luxury-shadow max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setIsEditing(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
            <h2 className="text-2xl font-black text-[var(--text-main)] mb-6">Edit Animal: {cow.tag}</h2>
            
            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-1 md:col-span-2 flex flex-col items-center mb-4">
                <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-md flex items-center justify-center text-4xl overflow-hidden mb-4 relative group">
                  {editCow.picture_url ? (
                    <img src={editCow.picture_url} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    '🐄'
                  )}
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold">Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Name</label>
                <input type="text" required value={editCow.name || ''} onChange={e => setEditCow({...editCow, name: e.target.value})} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--primary)]" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Gender</label>
                <select 
                  value={editCow.gender || 'Female'} 
                  onChange={e => {
                    const g = e.target.value as 'Female' | 'Male';
                    setEditCow({
                      ...editCow, 
                      gender: g,
                      status: g === 'Male' ? 'Male' : (editCow.status === 'Male' ? 'Lactating' : editCow.status)
                    });
                  }} 
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Breed</label>
                <input type="text" value={editCow.breed || ''} onChange={e => setEditCow({...editCow, breed: e.target.value})} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--primary)]" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Birth Date</label>
                <input type="date" required value={editCow.birthDate || ''} onChange={e => setEditCow({...editCow, birthDate: e.target.value})} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--primary)]" />
              </div>
              
              {editCow.gender === 'Female' ? (
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Status</label>
                  <select value={editCow.status || 'Lactating'} onChange={e => setEditCow({...editCow, status: e.target.value as any})} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--primary)]">
                    <option value="Lactating">Lactating</option>
                    <option value="Dry">Dry</option>
                    <option value="Pregnant">Pregnant</option>
                    <option value="Colostrum">Colostrum</option>
                    <option value="Heifer">Heifer (Non-Lactating)</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center justify-center p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-xs font-bold text-[var(--text-muted)]">Registered as Male Livestock</span>
                </div>
              )}

              {editCow.gender === 'Female' && (
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Number of Calves</label>
                  <input type="number" min="0" value={editCow.noOfCalves || 0} onChange={e => setEditCow({...editCow, noOfCalves: Number(e.target.value)})} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--primary)]" />
                </div>
              )}

              {/* Pedigree Dam & Sire Edit */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Mother / Dam Tag (Optional)</label>
                  <input 
                    type="text" 
                    value={editCow.motherTag || ''} 
                    onChange={e => setEditCow({...editCow, motherTag: e.target.value})} 
                    className="w-full bg-white border border-[var(--border)] rounded-xl py-2.5 px-3.5 text-sm font-bold focus:outline-none focus:border-[var(--primary)]" 
                    placeholder="e.g. T-045" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Father / Sire Tag or Breed (Optional)</label>
                  <input 
                    type="text" 
                    value={editCow.fatherTag || ''} 
                    onChange={e => setEditCow({...editCow, fatherTag: e.target.value})} 
                    className="w-full bg-white border border-[var(--border)] rounded-xl py-2.5 px-3.5 text-sm font-bold focus:outline-none focus:border-[var(--primary)]" 
                    placeholder="e.g. Bull-02 / Sahiwal Sire" 
                  />
                </div>
              </div>

              {/* Pregnancy Settings */}
              {editCow.gender === 'Female' && editCow.status === 'Pregnant' && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="md:col-span-2">
                    <h4 className="font-bold text-blue-900 mb-1">Pregnancy Details</h4>
                    <p className="text-xs text-blue-700">Expected calving date will be calculated automatically (~283 days from start).</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Pregnancy Start Date</label>
                    <input type="date" required value={editCow.pregnancyStartDate || ''} onChange={e => setEditCow({...editCow, pregnancyStartDate: e.target.value})} className="w-full bg-white border border-blue-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Sire/Upcoming Breed (Optional)</label>
                    <input type="text" value={editCow.upcomingCalfBreed || ''} onChange={e => setEditCow({...editCow, upcomingCalfBreed: e.target.value})} className="w-full bg-white border border-blue-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500" placeholder="e.g. Sahiwal" />
                  </div>
                </div>
              )}

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 font-bold text-[var(--text-muted)] hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl shadow-md transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Vaccination Modal */}
      {isScheduling && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl p-8 max-w-md w-full border border-[var(--border)] luxury-shadow relative">
            <button onClick={() => setIsScheduling(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
            <h2 className="text-2xl font-black text-[var(--text-main)] mb-6 flex items-center gap-2">
              <Syringe className="w-6 h-6 text-red-500" />
              Schedule Task
            </h2>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Task Type (e.g., FMD Vaccine)</label>
                <input type="text" required value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 px-4 focus:outline-none focus:border-red-300" placeholder="Vaccination Name..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Scheduled Date</label>
                <input type="date" required value={newTask.date} onChange={e => setNewTask({...newTask, date: e.target.value})} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 px-4 focus:outline-none focus:border-red-300" />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsScheduling(false)} className="px-6 py-3 font-bold text-[var(--text-muted)] hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-all">Confirm Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selectedTaskForEdit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl p-8 max-w-md w-full border border-[var(--border)] luxury-shadow relative">
            <button 
              onClick={() => { setSelectedTaskForEdit(null); setIsReschedulingTask(false); }} 
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>

            <div className="mb-6 flex flex-col items-center text-center mt-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <Syringe className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-[var(--text-main)] mb-1">{selectedTaskForEdit.type}</h2>
              <p className="text-sm font-bold text-[var(--text-muted)]">Target: Tag {selectedTaskForEdit.tag}</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Scheduled Date</p>
                  <p className="font-bold text-[var(--text-main)] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" /> {new Date(selectedTaskForEdit.date).toLocaleDateString()}
                  </p>
                </div>
                {selectedTaskForEdit.status === 'pending' && !isReschedulingTask && (
                  <button
                    onClick={() => setIsReschedulingTask(true)}
                    className="text-xs font-bold text-[var(--primary)] hover:underline px-2.5 py-1 bg-white border border-[var(--border)] rounded-lg shadow-sm"
                  >
                    Edit / Reschedule
                  </button>
                )}
              </div>
            </div>

            {/* Reschedule Form */}
            {isReschedulingTask && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6 space-y-3">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Reschedule Date / Name</h4>
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">Task Type</label>
                  <input 
                    type="text" 
                    value={rescheduledType} 
                    onChange={e => setRescheduledType(e.target.value)} 
                    className="w-full bg-white border border-amber-300 rounded-xl py-2 px-3 text-sm font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">New Scheduled Date</label>
                  <input 
                    type="date" 
                    value={rescheduledDate} 
                    onChange={e => setRescheduledDate(e.target.value)} 
                    className="w-full bg-white border border-amber-300 rounded-xl py-2 px-3 text-sm font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button 
                    type="button" 
                    onClick={() => setIsReschedulingTask(false)} 
                    className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleReschedule} 
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {selectedTaskForEdit.status === 'completed' ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center text-sm font-bold text-green-700 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Task Already Completed
              </div>
            ) : (() => {
              const today = new Date();
              today.setHours(0,0,0,0);
              const taskDate = new Date(selectedTaskForEdit.date);
              taskDate.setHours(0,0,0,0);
              const isFuture = taskDate.getTime() > today.getTime();

              if (isFuture) {
                return (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-medium text-blue-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>
                        This vaccination is scheduled for a future date ({new Date(selectedTaskForEdit.date).toLocaleDateString()}) and cannot be completed in advance. You can reschedule the date above if performed today.
                      </span>
                    </div>
                    <button 
                      disabled 
                      className="w-full py-3.5 rounded-xl font-bold text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200 text-sm"
                    >
                      Cannot Complete Before Scheduled Date
                    </button>
                  </div>
                );
              }

              return (
                <button 
                  onClick={handleCompleteTask}
                  className="w-full py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" /> Mark as Completed
                </button>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
