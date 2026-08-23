-- ==============================================================================
-- DAIRY FARM PWA - COMPLETE PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- Bidirectional Offline-First Synchronization & Role-Based Access
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES & ROLE-BASED AUTHENTICATION (Google OAuth + Email + MPIN)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee', 'manager')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on Supabase Auth Signup (e.g. Google OAuth or Email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'admin'),
        new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for auto updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. LIVESTOCK (Herd Directory, Lifecycle, Pedigree, Sold Archive)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.livestock (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    tag TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Lactating', -- 'Lactating', 'Dry', 'Pregnant', 'Colostrum', 'Heifer', 'Male', 'Sold'
    breed TEXT NOT NULL DEFAULT 'General Breed',
    gender TEXT NOT NULL DEFAULT 'Female' CHECK (gender IN ('Female', 'Male')),
    birth_date DATE,
    picture_url TEXT,
    no_of_calves INT DEFAULT 0,
    mother_tag TEXT,
    father_tag TEXT,
    pregnancy_start_date DATE,
    expected_calving_date DATE,
    upcoming_calf_breed TEXT,
    sale_price_pkr NUMERIC,
    sold_date DATE,
    sold_to TEXT,
    sold_reason_or_condition TEXT,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_livestock_tag ON public.livestock(tag);
CREATE INDEX IF NOT EXISTS idx_livestock_status ON public.livestock(status);
CREATE INDEX IF NOT EXISTS idx_livestock_updated_at ON public.livestock(updated_at);
CREATE INDEX IF NOT EXISTS idx_livestock_deleted_at ON public.livestock(deleted_at);

DROP TRIGGER IF EXISTS trg_livestock_updated_at ON public.livestock;
CREATE TRIGGER trg_livestock_updated_at
    BEFORE UPDATE ON public.livestock
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 3. MILKING LOGS (Session Yields)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.milking_logs (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    tag TEXT NOT NULL,
    yield_liters NUMERIC NOT NULL DEFAULT 0,
    milker_id TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_milking_tag ON public.milking_logs(tag);
CREATE INDEX IF NOT EXISTS idx_milking_timestamp ON public.milking_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_milking_updated_at ON public.milking_logs(updated_at);

DROP TRIGGER IF EXISTS trg_milking_updated_at ON public.milking_logs;
CREATE TRIGGER trg_milking_updated_at
    BEFORE UPDATE ON public.milking_logs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 4. MEDICAL & TREATMENT LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medical_logs (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    tag TEXT NOT NULL,
    condition TEXT NOT NULL,
    treatment TEXT NOT NULL,
    doctor_id TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_tag ON public.medical_logs(tag);
CREATE INDEX IF NOT EXISTS idx_medical_updated_at ON public.medical_logs(updated_at);

DROP TRIGGER IF EXISTS trg_medical_updated_at ON public.medical_logs;
CREATE TRIGGER trg_medical_updated_at
    BEFORE UPDATE ON public.medical_logs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 5. CUSTOMERS & WHOLESALE BUYERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    custom_rate NUMERIC NOT NULL DEFAULT 150,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_updated_at ON public.customers(updated_at);

DROP TRIGGER IF EXISTS trg_customers_updated_at ON public.customers;
CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 6. SALES & DISPATCH LOGS (Credit Dispatches)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sales_logs (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    customer_id BIGINT,
    customer_name TEXT,
    volume_liters NUMERIC NOT NULL,
    total_pkr NUMERIC NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_customer ON public.sales_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_timestamp ON public.sales_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_sales_updated_at ON public.sales_logs(updated_at);

DROP TRIGGER IF EXISTS trg_sales_updated_at ON public.sales_logs;
CREATE TRIGGER trg_sales_updated_at
    BEFORE UPDATE ON public.sales_logs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 7. CUSTOMER PAYMENTS (Cash & Bank Settlements / Khata)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customer_payments (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL,
    amount_pkr NUMERIC NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'Cash',
    notes TEXT,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_payments_customer ON public.customer_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_date ON public.customer_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_customer_payments_updated_at ON public.customer_payments(updated_at);

DROP TRIGGER IF EXISTS trg_cust_pay_updated_at ON public.customer_payments;
CREATE TRIGGER trg_cust_pay_updated_at
    BEFORE UPDATE ON public.customer_payments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 8. VACCINATION & MEDICAL TASKS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vaccination_tasks (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    tag TEXT,
    herd_wide BOOLEAN DEFAULT FALSE,
    type TEXT NOT NULL,
    date DATE NOT NULL,
    next_due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.vaccination_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON public.vaccination_tasks(date);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON public.vaccination_tasks(updated_at);

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.vaccination_tasks;
CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON public.vaccination_tasks
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 9. EMPLOYEES & STAFF ROSTER
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.employees (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Milker', 'Feeder', 'Doctor', 'Security', 'Worker')),
    phone TEXT NOT NULL,
    cnic TEXT,
    base_salary_pkr NUMERIC NOT NULL DEFAULT 25000,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    picture_url TEXT,
    facilities TEXT[],
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employees_role ON public.employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_updated_at ON public.employees(updated_at);

DROP TRIGGER IF EXISTS trg_employees_updated_at ON public.employees;
CREATE TRIGGER trg_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 10. SALARY & ADVANCE DISBURSALS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.salary_payments (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    employee_id BIGINT NOT NULL,
    amount_pkr NUMERIC NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    month TEXT NOT NULL,
    payment_type TEXT NOT NULL DEFAULT 'Salary' CHECK (payment_type IN ('Salary', 'Advance', 'Bonus', 'Deduction')),
    payment_method TEXT NOT NULL DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Bank Transfer', 'JazzCash / EasyPaisa')),
    notes TEXT,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_salary_emp ON public.salary_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_month ON public.salary_payments(month);
CREATE INDEX IF NOT EXISTS idx_salary_updated_at ON public.salary_payments(updated_at);

DROP TRIGGER IF EXISTS trg_salary_updated_at ON public.salary_payments;
CREATE TRIGGER trg_salary_updated_at
    BEFORE UPDATE ON public.salary_payments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 11. FEED & NUTRITION INVENTORY (Multi-Month Flexible Batches)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.feed_logs (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    feed_name TEXT NOT NULL,
    feed_type TEXT NOT NULL, -- 'Silage', 'Sorghum', 'Wanda / Concentrate', 'Wheat Straw', 'Green Fodder', 'Rhodes Grass', 'Other'
    category TEXT NOT NULL DEFAULT 'Prepared' CHECK (category IN ('Prepared', 'Bought')),
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL DEFAULT 'Mann (40kg)',
    cost_per_unit NUMERIC,
    total_amount_pkr NUMERIC NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_days INT DEFAULT 120, -- e.g. 120 days for 4 months bulk silage
    start_date DATE,
    end_date DATE,
    supplier_or_field TEXT,
    notes TEXT,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feed_type ON public.feed_logs(feed_type);
CREATE INDEX IF NOT EXISTS idx_feed_date ON public.feed_logs(date);
CREATE INDEX IF NOT EXISTS idx_feed_updated_at ON public.feed_logs(updated_at);

DROP TRIGGER IF EXISTS trg_feed_updated_at ON public.feed_logs;
CREATE TRIGGER trg_feed_updated_at
    BEFORE UPDATE ON public.feed_logs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 12. FARM OPERATING EXPENSES (WAPDA Electricity, Diesel, Medicines)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.expense_logs (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Electricity / WAPDA', 'Fuel / Diesel', 'Veterinary & Medicine', 'Maintenance & Repairs', 'Labor & Incidentals', 'Ration & Kitchen', 'Utilities', 'Other'
    amount_pkr NUMERIC NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    month TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'Cash',
    bill_number TEXT,
    notes TEXT,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expense_category ON public.expense_logs(category);
CREATE INDEX IF NOT EXISTS idx_expense_date ON public.expense_logs(date);
CREATE INDEX IF NOT EXISTS idx_expense_updated_at ON public.expense_logs(updated_at);

DROP TRIGGER IF EXISTS trg_expense_updated_at ON public.expense_logs;
CREATE TRIGGER trg_expense_updated_at
    BEFORE UPDATE ON public.expense_logs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (and anon clients if configured for farm tablet) full access
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
        AND tablename IN (
            'profiles', 'livestock', 'milking_logs', 'medical_logs', 'customers', 
            'sales_logs', 'customer_payments', 'vaccination_tasks', 'employees', 
            'salary_payments', 'feed_logs', 'expense_logs'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated all" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Allow authenticated all" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
        
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon all" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Allow anon all" ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true)', t);
    END LOOP;
END;
$$;
