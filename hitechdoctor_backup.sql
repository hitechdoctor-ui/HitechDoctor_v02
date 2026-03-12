--
-- PostgreSQL database dump
--

\restrict ITn0OZkdyJardDuLAvUsbnaBLTRVfPXt6vGKg2bm3IYMB5A14sL2cGspBrkMdC1

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP INDEX IF EXISTS public.customers_email_idx;
DROP INDEX IF EXISTS public.admin_users_email_idx;
ALTER TABLE IF EXISTS ONLY public.website_inquiries DROP CONSTRAINT IF EXISTS website_inquiries_pkey;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.repair_requests DROP CONSTRAINT IF EXISTS repair_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.repair_items DROP CONSTRAINT IF EXISTS repair_items_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_users DROP CONSTRAINT IF EXISTS admin_users_pkey;
ALTER TABLE IF EXISTS public.website_inquiries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.subscriptions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.repair_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.repair_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.customers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.admin_users ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.website_inquiries_id_seq;
DROP TABLE IF EXISTS public.website_inquiries;
DROP SEQUENCE IF EXISTS public.subscriptions_id_seq;
DROP TABLE IF EXISTS public.subscriptions;
DROP SEQUENCE IF EXISTS public.repair_requests_id_seq;
DROP TABLE IF EXISTS public.repair_requests;
DROP SEQUENCE IF EXISTS public.repair_items_id_seq;
DROP TABLE IF EXISTS public.repair_items;
DROP SEQUENCE IF EXISTS public.products_id_seq;
DROP TABLE IF EXISTS public.products;
DROP SEQUENCE IF EXISTS public.orders_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.order_items_id_seq;
DROP TABLE IF EXISTS public.order_items;
DROP SEQUENCE IF EXISTS public.customers_id_seq;
DROP TABLE IF EXISTS public.customers;
DROP SEQUENCE IF EXISTS public.admin_users_id_seq;
DROP TABLE IF EXISTS public.admin_users;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'admin'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_users OWNER TO postgres;

--
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_users_id_seq OWNER TO postgres;

--
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    address text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price_at_time numeric NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    total_amount numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    payment_method text DEFAULT 'cod'::text
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price numeric NOT NULL,
    image_url text,
    category text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    subcategory text,
    compatible_models text[],
    slug text,
    images text[],
    full_description text,
    brand text,
    color text,
    storage text,
    pre_order boolean DEFAULT false,
    variant_group text
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: repair_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repair_items (
    id integer NOT NULL,
    repair_request_id integer NOT NULL,
    description text NOT NULL,
    amount numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.repair_items OWNER TO postgres;

--
-- Name: repair_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.repair_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repair_items_id_seq OWNER TO postgres;

--
-- Name: repair_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_items_id_seq OWNED BY public.repair_items.id;


--
-- Name: repair_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repair_requests (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    device_name text NOT NULL,
    serial_number text NOT NULL,
    device_code text,
    notes text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    price numeric,
    price_includes_vat boolean DEFAULT false
);


ALTER TABLE public.repair_requests OWNER TO postgres;

--
-- Name: repair_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.repair_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repair_requests_id_seq OWNER TO postgres;

--
-- Name: repair_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_requests_id_seq OWNED BY public.repair_requests.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id integer NOT NULL,
    customer_name text NOT NULL,
    email text NOT NULL,
    phone text,
    type text NOT NULL,
    start_date timestamp without time zone NOT NULL,
    renewal_date timestamp without time zone NOT NULL,
    price numeric NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    notified_month_before boolean DEFAULT false,
    notified_ten_days_before boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    antivirus_name text
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscriptions_id_seq OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: website_inquiries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.website_inquiries (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    prepayment numeric,
    prepayment_includes_vat boolean DEFAULT true,
    notes text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.website_inquiries OWNER TO postgres;

--
-- Name: website_inquiries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.website_inquiries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.website_inquiries_id_seq OWNER TO postgres;

--
-- Name: website_inquiries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.website_inquiries_id_seq OWNED BY public.website_inquiries.id;


--
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: repair_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_items ALTER COLUMN id SET DEFAULT nextval('public.repair_items_id_seq'::regclass);


--
-- Name: repair_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests ALTER COLUMN id SET DEFAULT nextval('public.repair_requests_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: website_inquiries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.website_inquiries ALTER COLUMN id SET DEFAULT nextval('public.website_inquiries_id_seq'::regclass);


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_users (id, name, email, password_hash, role, created_at) FROM stdin;
1	HiTech Doctor Admin	hitechdoctor@gmail.com	$2b$12$FYR6zXjcPsA2sJR65S5mhuGgwpQUZI/pYMH93AVq.oTDdbw9ze.fi	superadmin	2026-03-11 23:09:03.728937
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, email, phone, address, created_at) FROM stdin;
1	Παπαδόπουλος Κώστας	rebelmobile@gmail.com	6981882005	Στρατηγού Μακρυγιάννη 109Στρατηγού Μακρυγιάννη 109	2026-03-03 21:35:23.674261
2	Γιώργης Παπαδόπουλος	giorges@test.com	6912345678	\N	2026-03-11 22:56:04.154792
3	Νίκος Δρογώσης	jyygfkfgku@mail.com	6944580996	\N	2026-03-11 22:56:04.154792
5	Γιώργος Παπαδόπουλος	test@test.com	6912345678	\N	2026-03-11 22:56:08.175353
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, quantity, price_at_time) FROM stdin;
2	2	18	1	1399
3	2	20	1	1499
4	2	91	1	675
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, customer_id, status, total_amount, created_at, payment_method) FROM stdin;
1	1	completed	60	2026-03-03 21:35:23.918774	cod
2	1	pending	3573	2026-03-06 11:08:25.185544	store
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, description, price, image_url, category, created_at, subcategory, compatible_models, slug, images, full_description, brand, color, storage, pre_order, variant_group) FROM stdin;
10	Τζάμι Προστασίας iPhone — Κεραμικό Premium	Κεραμικό προστατευτικό οθόνης Aurora Glisch premium ποιότητας. Ελαφρύτερο από γυαλί, εξαιρετικά ανθεκτικό στις γρατσουνιές και τις πτώσεις. Πλήρης ευαισθησία αφής & αντι-δακτυλικό oleophobic coating.	20.00	/images/tzami-prostasias-iphone-spigen-glastr-ez-fit-kit.webp	accessory	2026-03-03 21:40:13.456517	screen-protectors	{"iPhone 8","iPhone 8 Plus","iPhone X","iPhone XR","iPhone XS","iPhone XS Max","iPhone 11","iPhone 11 Pro","iPhone 11 Pro Max","iPhone 12 Mini","iPhone 12","iPhone 12 Pro","iPhone 12 Pro Max","iPhone 13 Mini","iPhone 13","iPhone 13 Pro","iPhone 13 Pro Max","iPhone 14","iPhone 14 Plus","iPhone 14 Pro","iPhone 14 Pro Max","iPhone 15","iPhone 15 Plus","iPhone 15 Pro","iPhone 15 Pro Max","iPhone 16","iPhone 16 Plus","iPhone 16 Pro","iPhone 16 Pro Max","iPhone 17","iPhone 17 Plus","iPhone 17 Pro","iPhone 17 Pro Max"}	tzami-prostasias-iphone-keramiko	{/images/tzami-prostasias-iphone-spigen-glastr-ez-fit-kit.webp}	\N	\N	\N	\N	f	\N
18	Apple iPhone 17 Pro Max (12/256GB) Deep Blue	iPhone 17 Pro Max. Το πιο ισχυρό iPhone που έχει υπάρξει ποτέ. Εκπληκτική οθόνη 6.9 ιντσών, A19 Pro chip, τριπλό σύστημα 48MP κάμερας με 8× οπτικό zoom, 12GB RAM, αυτονομία έως 39 ώρες και MagSafe 25W. Χρώμα Deep Blue.	1399	/images/iphone-17-pro-max-256gb-deep-blue-back-front.webp	mobile	2026-03-05 23:32:05.771966	\N	\N	apple-iphone-17-pro-max-256gb-deep-blue	{/images/iphone-17-pro-max-256gb-deep-blue-back-front.webp,/images/iphone-17-pro-max-256gb-deep-blue-display-front.webp,/images/iphone-17-pro-max-triple-camera-system-deep-blue.webp,/images/iphone-17-pro-max-deep-blue-side-profile.webp,/images/iphone-17-pro-max-what-is-in-the-box.webp}	<h2>Apple iPhone 17 Pro Max (12/256GB) Deep Blue — Το πιο ισχυρό iPhone</h2>\n  <p>iPhone 17 Pro Max. Το πιο ισχυρό iPhone που έχει υπάρξει ποτέ. Εκπληκτική οθόνη 6.9 ιντσών, σχεδιασμός από ενιαίο αλουμίνιο, A19 Pro chip, τριπλό σύστημα κάμερας 48MP και η μεγαλύτερη διάρκεια λειτουργίας μπαταρίας που έχει υπάρξει.</p>\n\n  <h2>Ενιαίος σχεδιασμός. Για εξαιρετική ισχύ.</h2>\n  <p>Σχεδιασμός από θερμικά σφυρηλατημένο αλουμίνιο για το πιο ισχυρό iPhone που έχει κατασκευαστεί ποτέ. Χρώμα: <strong>Deep Blue (βαθύ μπλε)</strong>.</p>\n\n  <h2>Ανθεκτικό Ceramic Shield. Μπροστά και πίσω.</h2>\n  <p>Το Ceramic Shield προστατεύει την πίσω μέρος του iPhone 17 Pro Max, καθιστώντας τα 4× πιο ανθεκτικά στις ρωγμές. Το νέο Ceramic Shield 2 στο μπροστινό μέρος προσφέρει 3× καλύτερη αντοχή στις γρατσουνιές.</p>\n\n  <h2>Το υπέρτατο επαγγελματικό σύστημα κάμερας</h2>\n  <p>Με όλες τις πίσω κάμερες στα 48MP και οπτικό ζουμ 8×, το iPhone 17 Pro Max έχει το μεγαλύτερο εύρος ζουμ που έχει υπάρξει ποτέ σε iPhone.</p>\n\n  <h2>Μπροστινή κάμερα Center Stage 18MP</h2>\n  <p>Έξυπνες ομαδικές selfies, βίντεο Dual Capture για ταυτόχρονη εγγραφή με μπροστινή και πίσω κάμερα και πολλά ακόμη.</p>\n\n  <h2>A19 Pro chip. Θάλαμος ατμού. Αστραπιαία ταχύτητα.</h2>\n  <p>Ο A19 Pro είναι ο πιο ισχυρός chip που έχει υπάρξει ποτέ σε iPhone, προσφέροντας έως και 40% καλύτερες επιδόσεις σε βάθος χρόνου.</p>\n\n  <h2>Η καλύτερη διάρκεια λειτουργίας μπαταρίας που έχει υπάρξει σε iPhone.</h2>\n  <p>Έως και 39 ώρες αναπαραγωγής βίντεο. Φόρτιση έως 50% σε μόλις 20 λεπτά με φορτιστή 40W. Ασύρματη φόρτιση MagSafe 25W.</p>\n\n  <h2>iOS 26. Νέα εμφάνιση. Ακόμη περισσότερη μαγεία.</h2>\n  <p>Φρέσκος σχεδιασμός με Liquid Glass. Ούριος, ευχάριστος και οικείος. Με πιο ζωντανό σύστημα ελέγχου και θεαματικές βελτιώσεις ενσωματωμένης Apple Intelligence.</p>\n\n  <h2>Χαρακτηριστικά ασφαλείας ζωτικής σημασίας</h2>\n  <p>Με τον Ανίχνευση Σύγκρουσης, το iPhone μπορεί να αναγνωρίσει ένα σοβαρό τροχαίο ατύχημα και να καλέσει βοήθεια αν δεν μπορείς.</p>\n\n  <h2>Περιεχόμενα συσκευασίας</h2>\n  <ul>\n  <li>iPhone με iOS 26</li>\n  <li>Καλώδιο φόρτισης USB-C (1 m)</li>\n  <li>Έντυπα οδηγών</li>\n  </ul>\n\n  <h2>Τι νέο θα δεις σε σχέση με το iPhone 16 Pro Max</h2>\n  <ul>\n  <li>Περισσότερη RAM (12 GB αντί για 8 GB) για καλύτερο multitasking</li>\n  <li>Τηλεφακός 48MP με 8× ζουμ — το μεγαλύτερο ζουμ στην ιστορία iPhone</li>\n  <li>Αναβαθμισμένη selfie κάμερα 18MP με Center Stage</li>\n  <li>Μεγαλύτερη φωτεινότητα οθόνης έως 3.000 nits</li>\n  <li>Αυτονομία 39 ωρών — 6 ώρες περισσότερες από το 16 Pro Max</li>\n  <li>Ταχύτερη φόρτιση 50% σε 20 λεπτά με φορτιστή 40W</li>\n  </ul>\n\n  <h2>Υπηρεσίες Επισκευής iPhone στην Αθήνα</h2>\n  <p>Κάτι πήγε στραβά; Στο HiTech Doctor προσφέρουμε <a href="/services/episkeui-iphone">επισκευή iPhone</a> με γνήσια ανταλλακτικά και εγγύηση 12 μήνες.</p>	Apple	Deep Blue	256GB	t	apple-iphone-17-pro-max-12-256gb
19	Apple iPhone 17 Pro Max (12/256GB) Cosmic Orange	iPhone 17 Pro Max. Το πιο ισχυρό iPhone που έχει υπάρξει ποτέ. Εκπληκτική οθόνη 6.9 ιντσών, A19 Pro chip, τριπλό σύστημα 48MP κάμερας με 8× οπτικό zoom, 12GB RAM, αυτονομία έως 39 ώρες. Χρώμα Cosmic Orange.	1469	/images/iphone-17-pro-max-256gb-cosmic-orange-back-front.webp	mobile	2026-03-05 23:48:12.423494	\N	\N	apple-iphone-17-pro-max-256gb-cosmic-orange	{/images/iphone-17-pro-max-256gb-cosmic-orange-back-front.webp,/images/iphone-17-pro-max-256gb-cosmic-orange-display-front.webp,/images/iphone-17-pro-max-256gb-cosmic-orange-side-profile.webp,/images/iphone-17-pro-max-triple-camera-system-cosmic-orange.webp}	<h2>Apple iPhone 17 Pro Max (12/256GB) Cosmic Orange — Το πιο ισχυρό iPhone</h2>\n  <p>iPhone 17 Pro Max. Το πιο ισχυρό iPhone που έχει υπάρξει ποτέ. Εκπληκτική οθόνη 6.9 ιντσών, σχεδιασμός από ενιαίο αλουμίνιο, A19 Pro chip, τριπλό σύστημα κάμερας 48MP και η μεγαλύτερη διάρκεια λειτουργίας μπαταρίας που έχει υπάρξει.</p>\n\n  <h2>Ενιαίος σχεδιασμός. Για εξαιρετική ισχύ.</h2>\n  <p>Σχεδιασμός από θερμικά σφυρηλατημένο αλουμίνιο για το πιο ισχυρό iPhone που έχει κατασκευαστεί ποτέ. Χρώμα: <strong>Cosmic Orange (φωτεινό πορτοκαλί)</strong>.</p>\n\n  <h2>Ανθεκτικό Ceramic Shield. Μπροστά και πίσω.</h2>\n  <p>Το Ceramic Shield προστατεύει την πίσω μέρος του iPhone 17 Pro Max, καθιστώντας τα 4× πιο ανθεκτικά στις ρωγμές. Το νέο Ceramic Shield 2 στο μπροστινό μέρος προσφέρει 3× καλύτερη αντοχή στις γρατσουνιές.</p>\n\n  <h2>Το υπέρτατο επαγγελματικό σύστημα κάμερας</h2>\n  <p>Με όλες τις πίσω κάμερες στα 48MP και οπτικό ζουμ 8×, το iPhone 17 Pro Max έχει το μεγαλύτερο εύρος ζουμ που έχει υπάρξει ποτέ σε iPhone.</p>\n\n  <h2>Μπροστινή κάμερα Center Stage 18MP</h2>\n  <p>Έξυπνες ομαδικές selfies, βίντεο Dual Capture για ταυτόχρονη εγγραφή με μπροστινή και πίσω κάμερα και πολλά ακόμη.</p>\n\n  <h2>A19 Pro chip. Θάλαμος ατμού. Αστραπιαία ταχύτητα.</h2>\n  <p>Ο A19 Pro είναι ο πιο ισχυρός chip που έχει υπάρξει ποτέ σε iPhone, προσφέροντας έως και 40% καλύτερες επιδόσεις σε βάθος χρόνου.</p>\n\n  <h2>Η καλύτερη διάρκεια λειτουργίας μπαταρίας που έχει υπάρξει σε iPhone.</h2>\n  <p>Έως και 39 ώρες αναπαραγωγής βίντεο. Φόρτιση έως 50% σε μόλις 20 λεπτά με φορτιστή 40W. Ασύρματη φόρτιση MagSafe 25W.</p>\n\n  <h2>iOS 26. Νέα εμφάνιση. Ακόμη περισσότερη μαγεία.</h2>\n  <p>Φρέσκος σχεδιασμός με Liquid Glass. Ούριος, ευχάριστος και οικείος. Με πιο ζωντανό σύστημα ελέγχου και θεαματικές βελτιώσεις ενσωματωμένης Apple Intelligence.</p>\n\n  <h2>Χαρακτηριστικά ασφαλείας ζωτικής σημασίας</h2>\n  <p>Με τον Ανίχνευση Σύγκρουσης, το iPhone μπορεί να αναγνωρίσει ένα σοβαρό τροχαίο ατύχημα και να καλέσει βοήθεια αν δεν μπορείς.</p>\n\n  <h2>Περιεχόμενα συσκευασίας</h2>\n  <ul>\n  <li>iPhone με iOS 26</li>\n  <li>Καλώδιο φόρτισης USB-C (1 m)</li>\n  <li>Έντυπα οδηγών</li>\n  </ul>\n\n  <h2>Τι νέο θα δεις σε σχέση με το iPhone 16 Pro Max</h2>\n  <ul>\n  <li>Περισσότερη RAM (12 GB αντί για 8 GB) για καλύτερο multitasking</li>\n  <li>Τηλεφακός 48MP με 8× ζουμ — το μεγαλύτερο ζουμ στην ιστορία iPhone</li>\n  <li>Αναβαθμισμένη selfie κάμερα 18MP με Center Stage</li>\n  <li>Μεγαλύτερη φωτεινότητα οθόνης έως 3.000 nits</li>\n  <li>Αυτονομία 39 ωρών — 6 ώρες περισσότερες από το 16 Pro Max</li>\n  <li>Ταχύτερη φόρτιση 50% σε 20 λεπτά με φορτιστή 40W</li>\n  </ul>\n\n  <h2>Υπηρεσίες Επισκευής iPhone στην Αθήνα</h2>\n  <p>Κάτι πήγε στραβά; Στο HiTech Doctor προσφέρουμε <a href="/services/episkeui-iphone">επισκευή iPhone</a> με γνήσια ανταλλακτικά και εγγύηση 12 μήνες.</p>	Apple	Cosmic Orange	256GB	t	apple-iphone-17-pro-max-12-256gb
20	Apple iPhone 17 Pro Max (12/256GB) Silver	iPhone 17 Pro Max. Το πιο ισχυρό iPhone που έχει υπάρξει ποτέ. Εκπληκτική οθόνη 6.9 ιντσών, A19 Pro chip, τριπλό σύστημα 48MP κάμερας με 8× οπτικό zoom, 12GB RAM, αυτονομία έως 39 ώρες. Χρώμα Silver.	1499	/images/iphone-17-pro-max-256gb-silver-back-front.webp	mobile	2026-03-05 23:48:16.25263	\N	\N	apple-iphone-17-pro-max-256gb-silver	{/images/iphone-17-pro-max-256gb-silver-back-front.webp,/images/iphone-17-pro-max-256gb-silver-display-front.webp,/images/iphone-17-pro-max-256gb-silver-side-profile.webp,/images/iphone-17-pro-max-triple-camera-system-silver.webp}	<h2>Apple iPhone 17 Pro Max (12/256GB) Silver — Το πιο ισχυρό iPhone</h2>\n  <p>iPhone 17 Pro Max. Το πιο ισχυρό iPhone που έχει υπάρξει ποτέ. Εκπληκτική οθόνη 6.9 ιντσών, σχεδιασμός από ενιαίο αλουμίνιο, A19 Pro chip, τριπλό σύστημα κάμερας 48MP και η μεγαλύτερη διάρκεια λειτουργίας μπαταρίας που έχει υπάρξει.</p>\n\n  <h2>Ενιαίος σχεδιασμός. Για εξαιρετική ισχύ.</h2>\n  <p>Σχεδιασμός από θερμικά σφυρηλατημένο αλουμίνιο για το πιο ισχυρό iPhone που έχει κατασκευαστεί ποτέ. Χρώμα: <strong>Silver (ασημί)</strong>.</p>\n\n  <h2>Ανθεκτικό Ceramic Shield. Μπροστά και πίσω.</h2>\n  <p>Το Ceramic Shield προστατεύει την πίσω μέρος του iPhone 17 Pro Max, καθιστώντας τα 4× πιο ανθεκτικά στις ρωγμές. Το νέο Ceramic Shield 2 στο μπροστινό μέρος προσφέρει 3× καλύτερη αντοχή στις γρατσουνιές.</p>\n\n  <h2>Το υπέρτατο επαγγελματικό σύστημα κάμερας</h2>\n  <p>Με όλες τις πίσω κάμερες στα 48MP και οπτικό ζουμ 8×, το iPhone 17 Pro Max έχει το μεγαλύτερο εύρος ζουμ που έχει υπάρξει ποτέ σε iPhone.</p>\n\n  <h2>Μπροστινή κάμερα Center Stage 18MP</h2>\n  <p>Έξυπνες ομαδικές selfies, βίντεο Dual Capture για ταυτόχρονη εγγραφή με μπροστινή και πίσω κάμερα και πολλά ακόμη.</p>\n\n  <h2>A19 Pro chip. Θάλαμος ατμού. Αστραπιαία ταχύτητα.</h2>\n  <p>Ο A19 Pro είναι ο πιο ισχυρός chip που έχει υπάρξει ποτέ σε iPhone, προσφέροντας έως και 40% καλύτερες επιδόσεις σε βάθος χρόνου.</p>\n\n  <h2>Η καλύτερη διάρκεια λειτουργίας μπαταρίας που έχει υπάρξει σε iPhone.</h2>\n  <p>Έως και 39 ώρες αναπαραγωγής βίντεο. Φόρτιση έως 50% σε μόλις 20 λεπτά με φορτιστή 40W. Ασύρματη φόρτιση MagSafe 25W.</p>\n\n  <h2>iOS 26. Νέα εμφάνιση. Ακόμη περισσότερη μαγεία.</h2>\n  <p>Φρέσκος σχεδιασμός με Liquid Glass. Ούριος, ευχάριστος και οικείος. Με πιο ζωντανό σύστημα ελέγχου και θεαματικές βελτιώσεις ενσωματωμένης Apple Intelligence.</p>\n\n  <h2>Χαρακτηριστικά ασφαλείας ζωτικής σημασίας</h2>\n  <p>Με τον Ανίχνευση Σύγκρουσης, το iPhone μπορεί να αναγνωρίσει ένα σοβαρό τροχαίο ατύχημα και να καλέσει βοήθεια αν δεν μπορείς.</p>\n\n  <h2>Περιεχόμενα συσκευασίας</h2>\n  <ul>\n  <li>iPhone με iOS 26</li>\n  <li>Καλώδιο φόρτισης USB-C (1 m)</li>\n  <li>Έντυπα οδηγών</li>\n  </ul>\n\n  <h2>Τι νέο θα δεις σε σχέση με το iPhone 16 Pro Max</h2>\n  <ul>\n  <li>Περισσότερη RAM (12 GB αντί για 8 GB) για καλύτερο multitasking</li>\n  <li>Τηλεφακός 48MP με 8× ζουμ — το μεγαλύτερο ζουμ στην ιστορία iPhone</li>\n  <li>Αναβαθμισμένη selfie κάμερα 18MP με Center Stage</li>\n  <li>Μεγαλύτερη φωτεινότητα οθόνης έως 3.000 nits</li>\n  <li>Αυτονομία 39 ωρών — 6 ώρες περισσότερες από το 16 Pro Max</li>\n  <li>Ταχύτερη φόρτιση 50% σε 20 λεπτά με φορτιστή 40W</li>\n  </ul>\n\n  <h2>Υπηρεσίες Επισκευής iPhone στην Αθήνα</h2>\n  <p>Κάτι πήγε στραβά; Στο HiTech Doctor προσφέρουμε <a href="/services/episkeui-iphone">επισκευή iPhone</a> με γνήσια ανταλλακτικά και εγγύηση 12 μήνες.</p>	Apple	Silver	256GB	t	apple-iphone-17-pro-max-12-256gb
21	Apple Φορτιστής χωρίς Καλώδιο 20W USB-C Λευκός (A2347)	Γνήσιος Apple Φορτιστής 20W USB-C χωρίς καλώδιο (Power Adapter A2347). Υποστηρίζει ταχεία φόρτιση USB Power Delivery. Συμβατός με iPhone 8 έως iPhone 17, iPad Pro, AirPods. Κωδικός MHJA3ZM/A.	29	/images/apple-20w-usb-c-charger-box.webp	accessory	2026-03-05 23:57:15.284519	chargers	\N	apple-fortistis-20w-usb-c-a2347	{/images/apple-20w-usb-c-charger-box.webp,/images/apple-20w-usb-c-charger-front.webp,/images/apple-20w-usb-c-charger-angle.webp,/images/apple-20w-usb-c-charger-bottom.webp}	<h2>Apple 20W USB-C Power Adapter (A2347) — Γνήσιος Φορτιστής Apple</h2>\n  <p>Ο <strong>Apple 20W USB-C Power Adapter</strong> είναι ο επίσημος γνήσιος φορτιστής της Apple με μία θύρα USB-C που υποστηρίζει <strong>ταχεία φόρτιση USB Power Delivery (20W)</strong>. Φορτίζει το iPhone σας έως <strong>50% σε μόλις 30 λεπτά</strong>.</p>\n\n  <h2>Ταχεία Φόρτιση με Power Delivery</h2>\n  <p>Σε συνδυασμό με USB-C καλώδιο ή USB-C to Lightning καλώδιο, ο 20W φορτιστής αξιοποιεί την τεχνολογία Power Delivery για εξαιρετικά γρήγορη φόρτιση. Ιδανικός για iPhone 8 και νεότερα, iPad Pro και AirPods Pro.</p>\n\n  <h2>Τεχνικά Χαρακτηριστικά</h2>\n  <ul>\n  <li><strong>Μοντέλο:</strong> A2347 (MHJA3ZM/A)</li>\n  <li><strong>Ισχύς εξόδου:</strong> 20W</li>\n  <li><strong>Θύρα:</strong> USB-C</li>\n  <li><strong>Χρώμα:</strong> Λευκό</li>\n  <li><strong>Τεχνολογία:</strong> USB Power Delivery 2.0</li>\n  <li><strong>Τάση εξόδου:</strong> 9V/2.22A, 5V/3A</li>\n  <li><strong>Πιστοποιήσεις:</strong> CE, EAC — Πλήρως συμβατός με ευρωπαϊκό ρεύμα 230V</li>\n  </ul>\n\n  <h2>Συμβατότητα</h2>\n  <ul>\n  <li>iPhone 8, 8 Plus, X, XS, XS Max, XR</li>\n  <li>iPhone 11, 11 Pro, 11 Pro Max</li>\n  <li>iPhone 12, 12 Mini, 12 Pro, 12 Pro Max</li>\n  <li>iPhone 13, 13 Mini, 13 Pro, 13 Pro Max</li>\n  <li>iPhone 14, 14 Plus, 14 Pro, 14 Pro Max</li>\n  <li>iPhone 15, 15 Plus, 15 Pro, 15 Pro Max</li>\n  <li>iPhone 16, 16 Plus, 16 Pro, 16 Pro Max</li>\n  <li>iPhone 17, 17 Plus, 17 Pro, 17 Pro Max</li>\n  <li>iPad Pro, iPad Air, iPad mini, AirPods Pro</li>\n  </ul>\n\n  <h2>Συμβατά Καλώδια</h2>\n  <ul>\n  <li>USB-C to Lightning (για iPhone έως 14 Plus)</li>\n  <li>USB-C to USB-C (για iPhone 15 και νεότερα)</li>\n  </ul>\n\n  <h2>Τι περιλαμβάνει η συσκευασία</h2>\n  <ul>\n  <li>Apple 20W USB-C Power Adapter (A2347)</li>\n  </ul>\n  <p><em>Το καλώδιο δεν συμπεριλαμβάνεται.</em></p>\n\n  <h2>Γιατί να επιλέξεις γνήσιο Apple φορτιστή;</h2>\n  <p>Τα μη γνήσια accessories μπορούν να βλάψουν τη μπαταρία του iPhone σου ή ακόμα και να προκαλέσουν ζημιά στο κύκλωμα. Ο γνήσιος Apple 20W φορτιστής είναι πιστοποιημένος και εγγυάται ασφαλή και αποτελεσματική φόρτιση.</p>	Apple	Λευκό	\N	f	\N
8	Τζάμι Προστασίας iPhone — Απλό (Tempered Glass)	Σκληρυμένο γυαλί προστασίας οθόνης 9H για iPhone. Κρατά την οθόνη αλώβητη από γρατσουνιές και πτώσεις. Εύκολη εφαρμογή χωρίς φυσαλίδες. Περιλαμβάνει πλήρες κιτ εγκατάστασης (πανάκι, αλκοόλ, sticker σκόνης).	8.00	/images/tzami-prostasias-iphone-spigen-glastr-ez-fit-kit.webp	accessory	2026-03-03 21:40:13.438225	screen-protectors	{"iPhone 8","iPhone 8 Plus","iPhone X","iPhone XR","iPhone XS","iPhone XS Max","iPhone 11","iPhone 11 Pro","iPhone 11 Pro Max","iPhone 12 Mini","iPhone 12","iPhone 12 Pro","iPhone 12 Pro Max","iPhone 13 Mini","iPhone 13","iPhone 13 Pro","iPhone 13 Pro Max","iPhone 14","iPhone 14 Plus","iPhone 14 Pro","iPhone 14 Pro Max","iPhone 15","iPhone 15 Plus","iPhone 15 Pro","iPhone 15 Pro Max","iPhone 16","iPhone 16 Plus","iPhone 16 Pro","iPhone 16 Pro Max","iPhone 17","iPhone 17 Plus","iPhone 17 Pro","iPhone 17 Pro Max"}	tzami-prostasias-iphone-aplo	{/images/tzami-prostasias-iphone-spigen-glastr-ez-fit-kit.webp}	\N	\N	\N	\N	f	\N
9	Τζάμι Προστασίας iPhone — Privacy	Τζάμι privacy Aurora Glisch 9H: εμποδίζει την πλαϊνή θέαση ώστε μόνο εσύ να βλέπεις την οθόνη. Darkness Activated Dark Privacy Tech. Ιδανικό για δημόσιους χώρους, μέσα μαζικής μεταφοράς και εργασία.	15.00	/images/tzami-prostasias-iphone-spigen-glastr-ez-fit-kit.webp	accessory	2026-03-03 21:40:13.449835	screen-protectors	{"iPhone 8","iPhone 8 Plus","iPhone X","iPhone XR","iPhone XS","iPhone XS Max","iPhone 11","iPhone 11 Pro","iPhone 11 Pro Max","iPhone 12 Mini","iPhone 12","iPhone 12 Pro","iPhone 12 Pro Max","iPhone 13 Mini","iPhone 13","iPhone 13 Pro","iPhone 13 Pro Max","iPhone 14","iPhone 14 Plus","iPhone 14 Pro","iPhone 14 Pro Max","iPhone 15","iPhone 15 Plus","iPhone 15 Pro","iPhone 15 Pro Max","iPhone 16","iPhone 16 Plus","iPhone 16 Pro","iPhone 16 Pro Max","iPhone 17","iPhone 17 Plus","iPhone 17 Pro","iPhone 17 Pro Max"}	tzami-prostasias-iphone-privacy	{/images/tzami-prostasias-iphone-spigen-glastr-ez-fit-kit.webp}	\N	\N	\N	\N	f	\N
22	Samsung Galaxy A16 4G 128GB Black	Samsung Galaxy A16 4G 128GB, Black. Smartphone.	143	https://b.scdn.gr/images/sku_main_images/057685/57685129/20241218164946_samsung_galaxy_a16_4g_dual_sim_4gb_128gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a16-4g-128gb-black	\N		Samsung	Black	128GB	f	\N
23	Samsung Galaxy A17 4G 128GB Gray	Samsung Galaxy A17 4G 128GB, Gray. Smartphone.	158	https://d.scdn.gr/images/sku_main_images/063015/63015056/xlarge_20250915123740_samsung_galaxy_a17_4g_dual_sim_4gb_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a17-4g-128gb-gray	\N	\N	Samsung	Gray	128GB	f	\N
24	Samsung Galaxy A17 4G 128GB Blue	Samsung Galaxy A17 4G 128GB, Blue. Smartphone.	158	https://d.scdn.gr/images/sku_main_images/063015/63015056/xlarge_20250915123740_samsung_galaxy_a17_4g_dual_sim_4gb_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a17-4g-128gb-blue	\N	\N	Samsung	Blue	128GB	f	\N
29	Samsung Galaxy A17 5G 128GB Black	Samsung Galaxy A17 5G 128GB, Black. Smartphone.	187	https://a.scdn.gr/images/sku_main_images/062516/62516909/xlarge_20250922161531_samsung_galaxy_a17_5g_dual_sim_4_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a17-5g-128gb-black	\N	\N	Samsung	Black	128GB	f	\N
30	Samsung Galaxy A17 5G 128GB Gray	Samsung Galaxy A17 5G 128GB, Gray. Smartphone.	187	https://a.scdn.gr/images/sku_main_images/062516/62516909/xlarge_20250922161531_samsung_galaxy_a17_5g_dual_sim_4_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a17-5g-128gb-gray	\N	\N	Samsung	Gray	128GB	f	\N
31	Samsung Galaxy A17 5G 128GB Blue	Samsung Galaxy A17 5G 128GB, Blue. Smartphone.	187	https://a.scdn.gr/images/sku_main_images/062516/62516909/xlarge_20250922161531_samsung_galaxy_a17_5g_dual_sim_4_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a17-5g-128gb-blue	\N	\N	Samsung	Blue	128GB	f	\N
36	Samsung Galaxy A36 5G 128GB Awesome White	Samsung Galaxy A36 5G 128GB, Awesome White. Smartphone.	255	https://c.scdn.gr/images/sku_main_images/059321/59321064/xlarge_20250319165639_samsung_galaxy_a36_5g_dual_sim_6gb_128gb_awesome_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a36-5g-128gb-awesome-white	\N	\N	Samsung	Awesome White	128GB	f	\N
37	Samsung Galaxy A36 5G 256GB Awesome Black	Samsung Galaxy A36 5G 256GB, Awesome Black. Smartphone.	285	https://c.scdn.gr/images/sku_main_images/059321/59321064/xlarge_20250319165639_samsung_galaxy_a36_5g_dual_sim_6gb_128gb_awesome_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a36-5g-256gb-awesome-black	\N	\N	Samsung	Awesome Black	256GB	f	\N
39	Samsung Galaxy S25 FE 5G 128GB Jet Black	Samsung Galaxy S25 FE 5G 128GB, Jet Black. Smartphone.	475	https://d.scdn.gr/images/sku_main_images/062896/62896023/xlarge_20250904164453_samsung_galaxy_s25_fe_5g_dual_sim_8_256gb_jetblack.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-s25-fe-5g-128gb-jet-black	\N	\N	Samsung	Jet Black	128GB	f	\N
40	Redmi A5 64GB Black	Redmi A5 64GB, Black. Smartphone.	107	https://d.scdn.gr/images/sku_main_images/059838/59838897/xlarge_20250416093249_xiaomi_redmi_a5_4g_dual_sim_3gb_64gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-a5-64gb-black	\N	\N	Redmi	Black	64GB	f	\N
41	Redmi 15C 128GB Black	Redmi 15C 128GB, Black. Smartphone.	131	https://c.scdn.gr/images/sku_main_images/062983/62983524/xlarge_20250916114737_xiaomi_redmi_15c_nfc_5g_dual_sim_4_256gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15c-128gb-black	\N	\N	Redmi	Black	128GB	f	\N
49	Redmi 15 NFC 4G 128GB Black	Redmi 15 NFC 4G 128GB, Black. Smartphone.	152	https://b.scdn.gr/images/sku_main_images/062042/62042146/xlarge_20250806112755_xiaomi_redmi_15_nfc_5g_dual_sim_8gb_256gb_titan_gray.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15-nfc-4g-128gb-black	\N	\N	Redmi	Black	128GB	f	\N
50	Redmi 15 NFC 4G 128GB Purple	Redmi 15 NFC 4G 128GB, Purple. Smartphone.	152	https://b.scdn.gr/images/sku_main_images/062042/62042146/xlarge_20250806112755_xiaomi_redmi_15_nfc_5g_dual_sim_8gb_256gb_titan_gray.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15-nfc-4g-128gb-purple	\N	\N	Redmi	Purple	128GB	f	\N
51	Redmi 15 NFC 4G 128GB Titanium	Redmi 15 NFC 4G 128GB, Titanium. Smartphone.	152	https://b.scdn.gr/images/sku_main_images/062042/62042146/xlarge_20250806112755_xiaomi_redmi_15_nfc_5g_dual_sim_8gb_256gb_titan_gray.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15-nfc-4g-128gb-titanium	\N	\N	Redmi	Titanium	128GB	f	\N
52	Redmi 15 NFC 4G 256GB Black	Redmi 15 NFC 4G 256GB, Black. Smartphone.	164	https://b.scdn.gr/images/sku_main_images/062042/62042146/xlarge_20250806112755_xiaomi_redmi_15_nfc_5g_dual_sim_8gb_256gb_titan_gray.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15-nfc-4g-256gb-black	\N	\N	Redmi	Black	256GB	f	\N
58	Redmi Note 15 NFC 4G 128GB Black	Redmi Note 15 NFC 4G 128GB, Black. Smartphone.	200	https://b.scdn.gr/images/sku_main_images/065038/65038043/xlarge_20260119104706_xiaomi_redmi_note_15_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-nfc-4g-128gb-black	\N	\N	Redmi	Black	128GB	f	\N
59	Redmi Note 15 NFC 4G 128GB Blue	Redmi Note 15 NFC 4G 128GB, Blue. Smartphone.	200	https://b.scdn.gr/images/sku_main_images/065038/65038043/xlarge_20260119104706_xiaomi_redmi_note_15_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-nfc-4g-128gb-blue	\N	\N	Redmi	Blue	128GB	f	\N
60	Redmi Note 15 NFC 4G 128GB Purple	Redmi Note 15 NFC 4G 128GB, Purple. Smartphone.	200	https://b.scdn.gr/images/sku_main_images/065038/65038043/xlarge_20260119104706_xiaomi_redmi_note_15_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-nfc-4g-128gb-purple	\N	\N	Redmi	Purple	128GB	f	\N
61	Redmi Note 15 NFC 4G 256GB Black	Redmi Note 15 NFC 4G 256GB, Black. Smartphone.	215	https://b.scdn.gr/images/sku_main_images/065038/65038043/xlarge_20260119104706_xiaomi_redmi_note_15_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-nfc-4g-256gb-black	\N	\N	Redmi	Black	256GB	f	\N
62	Redmi Note 15 NFC 4G 256GB Blue	Redmi Note 15 NFC 4G 256GB, Blue. Smartphone.	215	https://b.scdn.gr/images/sku_main_images/065038/65038043/xlarge_20260119104706_xiaomi_redmi_note_15_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-nfc-4g-256gb-blue	\N	\N	Redmi	Blue	256GB	f	\N
69	Redmi Note 15 Pro 4G NFC 256GB Black	Redmi Note 15 Pro 4G NFC 256GB, Black. Smartphone.	270	https://d.scdn.gr/images/sku_main_images/065037/65037111/xlarge_20260119095656_xiaomi_redmi_note_15_pro_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-pro-4g-nfc-256gb-black	\N	\N	Redmi	Black	256GB	f	\N
70	Redmi Note 15 Pro 4G NFC 256GB Blue	Redmi Note 15 Pro 4G NFC 256GB, Blue. Smartphone.	270	https://d.scdn.gr/images/sku_main_images/065037/65037111/xlarge_20260119095656_xiaomi_redmi_note_15_pro_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-pro-4g-nfc-256gb-blue	\N	\N	Redmi	Blue	256GB	f	\N
71	Redmi Note 15 Pro 5G NFC 256GB Black	Redmi Note 15 Pro 5G NFC 256GB, Black. Smartphone.	300	https://d.scdn.gr/images/sku_main_images/065037/65037111/xlarge_20260119095656_xiaomi_redmi_note_15_pro_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-pro-5g-nfc-256gb-black	\N	\N	Redmi	Black	256GB	f	\N
72	Redmi Note 15 Pro 5G NFC 256GB Blue	Redmi Note 15 Pro 5G NFC 256GB, Blue. Smartphone.	300	https://d.scdn.gr/images/sku_main_images/065037/65037111/xlarge_20260119095656_xiaomi_redmi_note_15_pro_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-pro-5g-nfc-256gb-blue	\N	\N	Redmi	Blue	256GB	f	\N
73	Redmi Note 15 Pro 5G NFC 256GB Titanium	Redmi Note 15 Pro 5G NFC 256GB, Titanium. Smartphone.	300	https://d.scdn.gr/images/sku_main_images/065037/65037111/xlarge_20260119095656_xiaomi_redmi_note_15_pro_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-pro-5g-nfc-256gb-titanium	\N	\N	Redmi	Titanium	256GB	f	\N
74	Redmi Note 15 Pro + 5G NFC 256GB Black	Redmi Note 15 Pro + 5G NFC 256GB, Black. Smartphone.	375	https://b.scdn.gr/images/sku_main_images/064810/64810683/xlarge_20260115132045_xiaomi_redmi_note_15_pro_5g_dual_sim_8gb_256gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-pro-5g-nfc-256gb-black-1	\N	\N	Redmi	Black	256GB	f	\N
75	Redmi Note 15 Pro + 5G NFC 256GB Blue	Redmi Note 15 Pro + 5G NFC 256GB, Blue. Smartphone.	375	https://b.scdn.gr/images/sku_main_images/064810/64810683/xlarge_20260115132045_xiaomi_redmi_note_15_pro_5g_dual_sim_8gb_256gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-pro-5g-nfc-256gb-blue-1	\N	\N	Redmi	Blue	256GB	f	\N
76	Redmi Note 15 Pro + 5G NFC 256GB Brown	Redmi Note 15 Pro + 5G NFC 256GB, Brown. Smartphone.	375	https://b.scdn.gr/images/sku_main_images/064810/64810683/xlarge_20260115132045_xiaomi_redmi_note_15_pro_5g_dual_sim_8gb_256gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-pro-5g-nfc-256gb-brown	\N	\N	Redmi	Brown	256GB	f	\N
77	Redmi Note 15 Pro + 5G NFC 512GB Black	Redmi Note 15 Pro + 5G NFC 512GB, Black. Smartphone.	415	https://b.scdn.gr/images/sku_main_images/064810/64810683/xlarge_20260115132045_xiaomi_redmi_note_15_pro_5g_dual_sim_8gb_256gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-pro-5g-nfc-512gb-black	\N	\N	Redmi	Black	512GB	f	\N
78	Redmi Note 15 Pro + 5G NFC 512GB Blue	Redmi Note 15 Pro + 5G NFC 512GB, Blue. Smartphone.	415	https://b.scdn.gr/images/sku_main_images/064810/64810683/xlarge_20260115132045_xiaomi_redmi_note_15_pro_5g_dual_sim_8gb_256gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-pro-5g-nfc-512gb-blue	\N	\N	Redmi	Blue	512GB	f	\N
79	Redmi Note 15 Pro + 5G NFC 512GB Brown	Redmi Note 15 Pro + 5G NFC 512GB, Brown. Smartphone.	415	https://b.scdn.gr/images/sku_main_images/064810/64810683/xlarge_20260115132045_xiaomi_redmi_note_15_pro_5g_dual_sim_8gb_256gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-pro-5g-nfc-512gb-brown	\N	\N	Redmi	Brown	512GB	f	\N
80	POCO C85 128GB Black	POCO C85 128GB, Black. Smartphone.	133	https://a.scdn.gr/images/sku_main_images/062897/62897340/xlarge_20250905091010_xiaomi_poco_c85_dual_sim_6gb_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	poco-c85-128gb-black	\N	\N	POCO	Black	128GB	f	\N
81	POCO C85 128GB Purple	POCO C85 128GB, Purple. Smartphone.	133	https://a.scdn.gr/images/sku_main_images/062897/62897340/xlarge_20250905091010_xiaomi_poco_c85_dual_sim_6gb_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	poco-c85-128gb-purple	\N	\N	POCO	Purple	128GB	f	\N
82	POCO C85 128GB Green	POCO C85 128GB, Green. Smartphone.	133	https://a.scdn.gr/images/sku_main_images/062897/62897340/xlarge_20250905091010_xiaomi_poco_c85_dual_sim_6gb_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	poco-c85-128gb-green	\N	\N	POCO	Green	128GB	f	\N
86	Apple iPhone 14 128GB Black	Apple iPhone 14 128GB, Black. Smartphone.	512	https://d.scdn.gr/images/sku_main_images/037990/37990587/xlarge_20250811153029_apple_iphone_14_6_128gb_blue.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	apple-iphone-14-128gb-black	\N	\N	Apple	Black	128GB	f	\N
87	Apple iPhone 15 128GB Black	Apple iPhone 15 128GB, Black. Smartphone.	575	https://b.scdn.gr/images/sku_main_images/045762/45762480/xlarge_20230915151209_apple_iphone_15_5g.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	apple-iphone-15-128gb-black	\N	\N	Apple	Black	128GB	f	\N
88	Apple iPhone 15 128GB Blue	Apple iPhone 15 128GB, Blue. Smartphone.	575	https://b.scdn.gr/images/sku_main_images/045762/45762480/xlarge_20230915151209_apple_iphone_15_5g.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	apple-iphone-15-128gb-blue	\N	\N	Apple	Blue	128GB	f	\N
89	Apple iPhone 16 128GB Pink	Apple iPhone 16 128GB, Pink. Smartphone.	675	https://c.scdn.gr/images/sku_main_images/055820/55820509/xlarge_20240913102458_apple_iphone_16_5g_8gb_128gb_black_proparagelia.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	apple-iphone-16-128gb-pink	\N	\N	Apple	Pink	128GB	f	\N
90	Apple iPhone 16 128GB White	Apple iPhone 16 128GB, White. Smartphone.	675	https://c.scdn.gr/images/sku_main_images/055820/55820509/xlarge_20240913102458_apple_iphone_16_5g_8gb_128gb_black_proparagelia.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	apple-iphone-16-128gb-white	\N	\N	Apple	White	128GB	f	\N
91	Apple iPhone 16 128GB Ultramarine	Apple iPhone 16 128GB, Ultramarine. Smartphone.	675	https://c.scdn.gr/images/sku_main_images/055820/55820509/xlarge_20240913102458_apple_iphone_16_5g_8gb_128gb_black_proparagelia.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	apple-iphone-16-128gb-ultramarine	\N	\N	Apple	Ultramarine	128GB	f	\N
92	Apple iPhone 16 128GB Teal	Apple iPhone 16 128GB, Teal. Smartphone.	675	https://c.scdn.gr/images/sku_main_images/055820/55820509/xlarge_20240913102458_apple_iphone_16_5g_8gb_128gb_black_proparagelia.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	apple-iphone-16-128gb-teal	\N	\N	Apple	Teal	128GB	f	\N
93	Apple iPhone 16e 128GB White	Apple iPhone 16e 128GB, White. Smartphone.	550	https://d.scdn.gr/images/sku_main_images/057426/57426386/xlarge_20250220114402_apple_iphone_16e_5g_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	apple-iphone-16e-128gb-white	\N	\N	Apple	White	128GB	f	\N
94	Apple iPhone 16e 128GB Black	Apple iPhone 16e 128GB, Black. Smartphone.	550	https://d.scdn.gr/images/sku_main_images/057426/57426386/xlarge_20250220114402_apple_iphone_16e_5g_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	apple-iphone-16e-128gb-black	\N	\N	Apple	Black	128GB	f	\N
95	Apple iPhone 17 256GB Black	Apple iPhone 17 256GB, Black. Smartphone.	800	https://d.scdn.gr/images/sku_main_images/062972/62972550/xlarge_20250910132335_apple_iphone_17_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	apple-iphone-17-256gb-black	\N	\N	Apple	Black	256GB	f	\N
96	Apple iPhone 17 256GB Blue	Apple iPhone 17 256GB, Blue. Smartphone.	800	https://d.scdn.gr/images/sku_main_images/062972/62972550/xlarge_20250910132335_apple_iphone_17_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	apple-iphone-17-256gb-blue	\N	\N	Apple	Blue	256GB	f	\N
99	Apple iPhone 17 Pro 256GB Silver	Apple iPhone 17 Pro 256GB, Silver. Smartphone.	1140	https://a.scdn.gr/images/sku_main_images/062956/62956504/xlarge_20250910133510_apple_iphone_17_pro_12_256gb_deep_blue.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	apple-iphone-17-pro-256gb-silver	\N	\N	Apple	Silver	256GB	f	\N
100	Apple iPhone 17 Pro 256GB Blue	Apple iPhone 17 Pro 256GB, Blue. Smartphone.	1140	https://a.scdn.gr/images/sku_main_images/062956/62956504/xlarge_20250910133510_apple_iphone_17_pro_12_256gb_deep_blue.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	apple-iphone-17-pro-256gb-blue	\N	\N	Apple	Blue	256GB	f	\N
101	Lenovo Thinkpad L540 Intel i5-4300M GRADE B	Μεταχειρισμένο laptop, 240GB SSD, 8GB DDR3, GRADE B	200.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/l/a/lapr-len-l540-i5-b-c-t-kb.png	laptop	2026-03-06 09:27:59.501291	laptop	\N	lenovo-thinkpad-l540-i5-4300m-grade-b-240ssd	\N	Μεταχειρισμένο laptop Lenovo Thinkpad L540 με επεξεργαστή Intel Core i5-4300M, 240GB SSD, 8GB DDR3 RAM. Βαθμολογία GRADE B — καλή κατάσταση με μικρές αισθητικές φθορές. Πλήρης λειτουργία, 1 χρόνο εγγύηση.	Lenovo	\N	\N	f	\N
102	Microsoft Surface Laptop 1 Intel i5-7300U GRADE B	Μεταχειρισμένο laptop, 240GB SSD, 8GB DDR3L, GRADE B	305.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/l/a/lapr-ms-1769-b-c.jpg	laptop	2026-03-06 09:27:59.501291	laptop	\N	microsoft-surface-laptop-1-i5-7300u-grade-b	\N	Μεταχειρισμένο Microsoft Surface Laptop 1 με Intel Core i5-7300U, 240GB SSD, 8GB DDR3L RAM. Κομψό design, αντικείμενο GRADE B — πλήρης λειτουργία με ελάχιστες αισθητικές φθορές. 1 χρόνο εγγύηση.	Microsoft	\N	\N	f	\N
103	Lenovo ThinkPad X1 Carbon Gen 3 Intel i7-5600U GRADE A-	Μεταχειρισμένο ultrabook, 240GB SSD M.2, 8GB DDR3, GRADE A-	280.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/l/a/lapr-len-x1g3-i7-a-t_1.jpg	laptop	2026-03-06 09:27:59.501291	laptop	\N	lenovo-thinkpad-x1-carbon-gen3-i7-5600u-grade-a-minus	\N	Ελαφρύ και ισχυρό Lenovo ThinkPad X1 Carbon Gen 3 με Intel Core i7-5600U, 240GB SSD M.2 SATA, 8GB DDR3 RAM. Νέα μπαταρία! GRADE A- — σχεδόν άριστη κατάσταση. 1 χρόνο εγγύηση.	Lenovo	\N	\N	f	\N
104	Microsoft Surface Laptop 2 Intel i5-8350U GRADE B	Μεταχειρισμένο laptop, 240GB SSD, 8GB DDR4, GRADE B	355.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/l/a/lapr-ms-1769-2-i5-b-wb.jpg	laptop	2026-03-06 09:27:59.501291	laptop	\N	microsoft-surface-laptop-2-i5-8350u-grade-b	\N	Microsoft Surface Laptop 2 (1769) με Intel Core i5-8350U, 240GB SSD, 8GB DDR4 RAM. Εκλεπτυσμένο design, GRADE B — πλήρης λειτουργία. Σημείωση: Wi-Fi/Bluetooth ελαφρώς περιορισμένα. 1 χρόνο εγγύηση.	Microsoft	\N	\N	f	\N
105	Lenovo Thinkpad E14 Ryzen 7 4700U GRADE B	Μεταχειρισμένο laptop, 240GB SSD NVMe, 8GB DDR4, GRADE B	452.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/l/a/lapr-len-e14-r7-a-c-t.jpg	laptop	2026-03-06 09:27:59.501291	laptop	\N	lenovo-thinkpad-e14-ryzen7-4700u-grade-b	\N	Ισχυρό Lenovo ThinkPad E14 με AMD Ryzen 7 4700U (8 πυρήνες), 240GB SSD M.2 NVMe, 8GB DDR4 RAM. GRADE B — άριστη απόδοση για εργασία & πολυμέσα. 1 χρόνο εγγύηση.	Lenovo	\N	\N	f	\N
106	Lenovo ThinkPad T540p Intel i7-4810MQ GRADE A-	Μεταχειρισμένο laptop, 240GB SSD, 16GB DDR3, GRADE A-	256.50	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/l/a/lapr-len-t540p-i5-a-c-kb_1.jpg	laptop	2026-03-06 09:27:59.501291	laptop	\N	lenovo-thinkpad-t540p-i7-4810mq-grade-a-minus	\N	Lenovo ThinkPad T540p με Intel Core i7-4810MQ quad-core, 240GB SSD, 16GB DDR3 RAM. Εξαιρετική απόδοση για το επίπεδο τιμής. GRADE A- — σχεδόν άριστη κατάσταση. 1 χρόνο εγγύηση.	Lenovo	\N	\N	f	\N
107	Microsoft Surface Go 3 Intel Pentium Gold 6500Y	Μεταχειρισμένο 2-in-1 tablet/laptop, 120GB SSD, 8GB DDR3, GRADE A	386.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/l/a/lapr-ms-sur-go3-pentium.jpg	laptop	2026-03-06 09:27:59.501291	laptop	\N	microsoft-surface-go-3-pentium-gold-6500y-grade-a	\N	Microsoft Surface Go 3 με Intel Pentium Gold 6500Y, 120GB SSD, 8GB DDR3 RAM. Compact 10.5' tablet/laptop 2-in-1, ιδανικό για φοιτητές και καθημερινή χρήση. GRADE A. 1 χρόνο εγγύηση.	Microsoft	\N	\N	f	\N
56	Redmi 15 NFC 5G 128GB Green	Redmi 15 NFC 5G 128GB, Green. Smartphone.	175	https://b.scdn.gr/images/sku_main_images/062042/62042146/xlarge_20250806112755_xiaomi_redmi_15_nfc_5g_dual_sim_8gb_256gb_titan_gray.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15-nfc-5g-128gb-green	\N	\N	Redmi	Green	128GB	f	\N
57	Redmi 15 NFC 5G 256GB Black	Redmi 15 NFC 5G 256GB, Black. Smartphone.	192	https://b.scdn.gr/images/sku_main_images/062042/62042146/xlarge_20250806112755_xiaomi_redmi_15_nfc_5g_dual_sim_8gb_256gb_titan_gray.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15-nfc-5g-256gb-black	\N	\N	Redmi	Black	256GB	f	\N
64	Redmi Note 15 NFC 5G 128GB Black	Redmi Note 15 NFC 5G 128GB, Black. Smartphone.	233	https://b.scdn.gr/images/sku_main_images/065038/65038043/xlarge_20260119104706_xiaomi_redmi_note_15_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-nfc-5g-128gb-black	\N	\N	Redmi	Black	128GB	f	\N
65	Redmi Note 15 NFC 5G 128GB Blue	Redmi Note 15 NFC 5G 128GB, Blue. Smartphone.	233	https://b.scdn.gr/images/sku_main_images/065038/65038043/xlarge_20260119104706_xiaomi_redmi_note_15_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-nfc-5g-128gb-blue	\N	\N	Redmi	Blue	128GB	f	\N
66	Redmi Note 15 NFC 5G 128GB Purple	Redmi Note 15 NFC 5G 128GB, Purple. Smartphone.	233	https://b.scdn.gr/images/sku_main_images/065038/65038043/xlarge_20260119104706_xiaomi_redmi_note_15_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-nfc-5g-128gb-purple	\N	\N	Redmi	Purple	128GB	f	\N
67	Redmi Note 15 NFC 5G 256GB Black	Redmi Note 15 NFC 5G 256GB, Black. Smartphone.	255	https://b.scdn.gr/images/sku_main_images/065038/65038043/xlarge_20260119104706_xiaomi_redmi_note_15_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-nfc-5g-256gb-black	\N	\N	Redmi	Black	256GB	f	\N
68	Redmi Note 15 NFC 5G 256GB Purple	Redmi Note 15 NFC 5G 256GB, Purple. Smartphone.	255	https://b.scdn.gr/images/sku_main_images/065038/65038043/xlarge_20260119104706_xiaomi_redmi_note_15_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-nfc-5g-256gb-purple	\N	\N	Redmi	Purple	256GB	f	\N
83	POCO C85 256GB Black	POCO C85 256GB, Black. Smartphone.	147	https://a.scdn.gr/images/sku_main_images/062897/62897340/xlarge_20250905091010_xiaomi_poco_c85_dual_sim_6gb_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	poco-c85-256gb-black	\N	\N	POCO	Black	256GB	f	\N
84	POCO C85 256GB Purple	POCO C85 256GB, Purple. Smartphone.	147	https://a.scdn.gr/images/sku_main_images/062897/62897340/xlarge_20250905091010_xiaomi_poco_c85_dual_sim_6gb_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	poco-c85-256gb-purple	\N	\N	POCO	Purple	256GB	f	\N
85	POCO C85 256GB Green	POCO C85 256GB, Green. Smartphone.	147	https://a.scdn.gr/images/sku_main_images/062897/62897340/xlarge_20250905091010_xiaomi_poco_c85_dual_sim_6gb_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	poco-c85-256gb-green	\N	\N	POCO	Green	256GB	f	\N
97	Apple iPhone 17 256GB Lavender	Apple iPhone 17 256GB, Lavender. Smartphone.	800	https://d.scdn.gr/images/sku_main_images/062972/62972550/xlarge_20250910132335_apple_iphone_17_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	apple-iphone-17-256gb-lavender	\N	\N	Apple	Lavender	256GB	f	\N
108	Lenovo V330-14IKB Intel i5-8250U GRADE A-	Μεταχειρισμένο laptop, 240GB SSD NVMe, 8GB DDR4, GRADE A-	272.50	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/l/a/lapr-len-v330-14ikb-i5-a-c_19-11_3.jpg	laptop	2026-03-06 09:27:59.501291	laptop	\N	lenovo-v330-14ikb-i5-8250u-grade-a-minus	\N	Lenovo V330-14IKB με Intel Core i5-8250U, 240GB SSD M.2 NVMe, 8GB DDR4 RAM. GRADE A- — σχεδόν άριστη εμφανισιακή κατάσταση. Ιδανικό για εργασία γραφείου. 1 χρόνο εγγύηση.	Lenovo	\N	\N	f	\N
109	Lenovo V330-14IKB Intel i5-8250U GRADE B (USB-A)	Μεταχειρισμένο laptop, 240GB SSD NVMe, 8GB DDR4, GRADE B	242.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/l/a/lapr-len-v330-14ikb-i5-b-c.jpg	laptop	2026-03-06 09:27:59.501291	laptop	\N	lenovo-v330-14ikb-i5-8250u-grade-b-usba	\N	Lenovo V330-14IKB με Intel Core i5-8250U, 240GB SSD M.2 NVMe, 8GB DDR4 RAM. GRADE B — καλή κατάσταση. Διαθέτει USB-A θύρα. 1 χρόνο εγγύηση.	Lenovo	\N	\N	f	\N
110	Lenovo V330-14IKB Intel i5-8250U LOW BATTERY GRADE B	Μεταχειρισμένο laptop, 240GB SSD NVMe, 8GB DDR4, χαμηλή μπαταρία	232.50	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/l/a/lapr-len-v330-14ikb-i5-b-ct.jpg	laptop	2026-03-06 09:27:59.501291	laptop	\N	lenovo-v330-14ikb-i5-8250u-low-battery-grade-b	\N	Lenovo V330-14IKB με Intel Core i5-8250U, 240GB SSD M.2 NVMe, 8GB DDR4 RAM. GRADE B — καλή κατάσταση. Σημείωση: η μπαταρία έχει χαμηλή αυτονομία (low battery health). 1 χρόνο εγγύηση.	Lenovo	\N	\N	f	\N
111	Lenovo V330-14IKB Intel i5-8250U GRADE B (USB3)	Μεταχειρισμένο laptop, 240GB SSD NVMe, 8GB DDR4, GRADE B	242.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/l/a/lapr-len-v330-14ikb-i5-b-ckb.jpg	laptop	2026-03-06 09:27:59.501291	laptop	\N	lenovo-v330-14ikb-i5-8250u-grade-b-usb3	\N	Lenovo V330-14IKB με Intel Core i5-8250U, 240GB SSD M.2 NVMe, 8GB DDR4 RAM. GRADE B — καλή κατάσταση. Διαθέτει USB 3.0 θύρα. 1 χρόνο εγγύηση.	Lenovo	\N	\N	f	\N
112	Lenovo V330-14IKB Intel i5-8250U GRADE B (USB-C)	Μεταχειρισμένο laptop, 240GB SSD NVMe, 8GB DDR4, GRADE B	242.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/l/a/lapr-len-v330-14ikb-i5-b-cusbc.jpg	laptop	2026-03-06 09:27:59.501291	laptop	\N	lenovo-v330-14ikb-i5-8250u-grade-b-usbc	\N	Lenovo V330-14IKB με Intel Core i5-8250U, 240GB SSD M.2 NVMe, 8GB DDR4 RAM. GRADE B — καλή κατάσταση. Διαθέτει USB-C θύρα. 1 χρόνο εγγύηση.	Lenovo	\N	\N	f	\N
113	Lenovo Thinkpad L540 Intel i5-4300M GRADE B (120GB)	Μεταχειρισμένο laptop, 120GB SSD, 8GB DDR3, GRADE B	200.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/l/a/lapr-len-l540-i5-b-c.png	laptop	2026-03-06 09:27:59.501291	laptop	\N	lenovo-thinkpad-l540-i5-4300m-grade-b-120ssd	\N	Μεταχειρισμένο laptop Lenovo Thinkpad L540 με Intel Core i5-4300M, 120GB SSD, 8GB DDR3 RAM. GRADE B — καλή κατάσταση. Οικονομική επιλογή για βασική χρήση. 1 χρόνο εγγύηση.	Lenovo	\N	\N	f	\N
120	DELL Embedded 5000 Intel i5-6440EQ BOX PC GRADE A	Μεταχειρισμένος υπολογιστής, 120GB SSD, 8GB DDR4, GRADE A	257.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/c/4/c4b8b5c6c67974f3287fe1e812964c8b.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	dell-embedded-5000-i5-6440eq-box-grade-a	\N	Ισχυρός mini υπολογιστής DELL Embedded 5000 με επεξεργαστή Intel Core i5-6440EQ (τετραπύρηνος), 120GB SSD, 8GB DDR4 RAM. Μορφή BOX PC — εξαιρετικά συμπαγής, ιδανικός για γραφείο ή POS. GRADE A, 1 χρόνο εγγύηση.	DELL	\N	\N	f	\N
121	DELL FX160 Intel Atom 230 USFF GRADE A	Μεταχειρισμένος υπολογιστής, 2GB SSD, 4GB DDR2, GRADE A	40.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/f/b/fbbf0e98a2474b0ec0d66f802a9364df.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	dell-fx160-atom-230-usff-grade-a	\N	Πολύ μικρός υπολογιστής DELL FX160 με Intel Atom 230, 2GB SSD, 4GB DDR2 RAM. Μορφή USFF — Ultra Small Form Factor. Ιδανικός για ελαφριές εργασίες. GRADE A, 1 χρόνο εγγύηση.	DELL	\N	\N	f	\N
122	IBM SurePOS 4800-E84 Intel Core 2 Duo E7400 DESKTOP GRADE A-	Μεταχειρισμένος υπολογιστής, 160GB HDD, 4GB DDR3, GRADE A-	65.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/4/9/492651e8a6a8fe25a1edad17aee04fea.png	desktop	2026-03-06 09:57:24.037165	desktop	\N	ibm-surepos-4800-e84-c2d-e7400-desktop-grade-a-minus	\N	Επαγγελματικός υπολογιστής IBM SurePOS 4800-E84 με Intel Core 2 Duo E7400, 160GB HDD, 4GB DDR3 RAM. Σχεδιασμένος για POS και εμπορικές εφαρμογές. GRADE A-, 1 χρόνο εγγύηση.	IBM	\N	\N	f	\N
123	HP ProDesk 600 G3 Intel i5-6500 SFF GRADE A	Μεταχειρισμένος υπολογιστής, 240GB SSD, 8GB DDR4, GRADE A	143.50	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-hp-600g3-s-i5.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	hp-prodesk-600-g3-i5-6500-sff-grade-a	\N	HP ProDesk 600 G3 με Intel Core i5-6500, 240GB SSD, 8GB DDR4 RAM. Μορφή SFF (Small Form Factor) — συμπαγής και ήσυχος για το γραφείο. GRADE A, 1 χρόνο εγγύηση.	HP	\N	\N	f	\N
124	Fujitsu Esprimo D958 Intel i5-8500 SFF GRADE B	Μεταχειρισμένος υπολογιστής, 240GB SSD, 8GB DDR4, GRADE B	265.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-fuj-d958-s-i5-b-f_04-02-2026.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	fujitsu-esprimo-d958-i5-8500-sff-grade-b	\N	Fujitsu Esprimo D958 με Intel Core i5-8500 (8η γενιά), 240GB SSD, 8GB DDR4 RAM. Αξιόπιστο επαγγελματικό μηχάνημα. Μορφή SFF. GRADE B, 1 χρόνο εγγύηση.	Fujitsu	\N	\N	f	\N
125	DELL Optiplex 3040 Intel i5-6500 SFF GRADE A	Μεταχειρισμένος υπολογιστής, 240GB SSD, 8GB DDR3, GRADE A	144.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-dl-3040-s-i5-1510.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	dell-optiplex-3040-i5-6500-sff-grade-a	\N	DELL Optiplex 3040 με Intel Core i5-6500, 240GB SSD, 8GB DDR3 RAM. Μορφή SFF. Πολύ αξιόπιστο μοντέλο για εταιρικό περιβάλλον. GRADE A, 1 χρόνο εγγύηση.	DELL	\N	\N	f	\N
126	DELL Optiplex 3080 Intel i5-10500 SFF GRADE A	Μεταχειρισμένος υπολογιστής, 240GB SSD M.2 NVMe, 8GB DDR4, GRADE A	506.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-dl-3080-s-i5.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	dell-optiplex-3080-i5-10500-sff-grade-a	\N	DELL Optiplex 3080 με Intel Core i5-10500 (10η γενιά), 240GB SSD M.2 NVMe (2230), 8GB DDR4 RAM. Ισχυρή και ταχύτατη επιλογή σε μορφή SFF. GRADE A, 1 χρόνο εγγύηση.	DELL	\N	\N	f	\N
63	Redmi Note 15 NFC 4G 256GB Purple	Redmi Note 15 NFC 4G 256GB, Purple. Smartphone.	215	https://b.scdn.gr/images/sku_main_images/065038/65038043/xlarge_20260119104706_xiaomi_redmi_note_15_nfc_5g_dual_sim_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-note-15-nfc-4g-256gb-purple	\N	\N	Redmi	Purple	256GB	f	\N
127	DELL Optiplex 3060 Intel i5-8500T Micro GRADE A	Μεταχειρισμένος υπολογιστής, 256GB SSD M.2 NVMe, 8GB DDR4, GRADE A	312.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-dl-3060-m-i5-151.png	desktop	2026-03-06 09:57:24.037165	desktop	\N	dell-optiplex-3060-i5-8500t-micro-grade-a	\N	DELL Optiplex 3060 Micro με Intel Core i5-8500T, 256GB SSD M.2 NVMe (νέο), 8GB DDR4 RAM. Εξαιρετικά συμπαγής μορφή Micro. GRADE A, 1 χρόνο εγγύηση.	DELL	\N	\N	f	\N
128	Lenovo ThinkCentre M91p Intel i5-2400S USFF GRADE A-	Μεταχειρισμένος υπολογιστής, 500GB HDD, 4GB DDR3, GRADE A-	73.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-len-m91p-u-i5-a-271.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	lenovo-thinkcentre-m91p-i5-2400s-usff-grade-a-minus	\N	Lenovo ThinkCentre M91p με Intel Core i5-2400S, 500GB HDD, 4GB DDR3 RAM. Μορφή USFF (Ultra Small Form Factor). GRADE A-, 1 χρόνο εγγύηση.	Lenovo	\N	\N	f	\N
129	HP ProDesk 400 G5 Intel i5-8400 SFF GRADE A	Μεταχειρισμένος υπολογιστής, 240GB SSD, 8GB DDR4, GRADE A	305.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-hp-400g5-s-i5.png	desktop	2026-03-06 09:57:24.037165	desktop	\N	hp-prodesk-400-g5-i5-8400-sff-grade-a	\N	HP ProDesk 400 G5 με Intel Core i5-8400 (8η γενιά), 240GB SSD, 8GB DDR4 RAM. Αξιόπιστη επιλογή για γραφείο σε μορφή SFF. GRADE A, 1 χρόνο εγγύηση.	HP	\N	\N	f	\N
130	HP ProDesk 600 G4 Intel i3-8100T Mini GRADE A	Μεταχειρισμένος υπολογιστής, 256GB SSD M.2 NVMe, 8GB DDR4, GRADE A	208.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-hp-600g4-m-i3_01-16.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	hp-prodesk-600-g4-i3-8100t-mini-grade-a	\N	HP ProDesk 600 G4 Mini με Intel Core i3-8100T, 256GB SSD M.2 NVMe (νέο), 8GB DDR4 RAM. Εξαιρετικά μικρός Mini υπολογιστής. GRADE A, 1 χρόνο εγγύηση.	HP	\N	\N	f	\N
131	HP ProDesk 600 G3 Intel i3-6100 SFF GRADE A	Μεταχειρισμένος υπολογιστής, 240GB SSD, 8GB DDR4, GRADE A	95.50	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-hp-600g3-s-i3-06082.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	hp-prodesk-600-g3-i3-6100-sff-grade-a	\N	HP ProDesk 600 G3 με Intel Core i3-6100, 240GB SSD, 8GB DDR4 RAM. Οικονομική επιλογή για εταιρικό γραφείο σε μορφή SFF. GRADE A, 1 χρόνο εγγύηση.	HP	\N	\N	f	\N
132	DELL Optiplex 3080 Intel i5-10500T Micro GRADE A	Μεταχειρισμένος υπολογιστής, 240GB SSD M.2 NVMe, 8GB DDR4, GRADE A	450.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-dl-3080-m-i5.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	dell-optiplex-3080-i5-10500t-micro-grade-a	\N	DELL Optiplex 3080 Micro με Intel Core i5-10500T (10η γενιά), 240GB SSD M.2 NVMe (2230), 8GB DDR4 RAM. Εξαιρετικά συμπαγής μορφή Micro. GRADE A, 1 χρόνο εγγύηση.	DELL	\N	\N	f	\N
133	Apple iMac 21.5" A1418 Late 2013 Intel i5 GRADE A-	Μεταχειρισμένος All-in-One υπολογιστής, 120GB SSD, 16GB DDR3, GRADE A-	265.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-app-imac-l13-a-c.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	apple-imac-21-5-a1418-late-2013-i5-grade-a-minus	\N	Apple iMac 21.5" A1418 (Late 2013) με Intel Core i5, 120GB SSD, 16GB DDR3 RAM. All-in-One σχεδίαση — οθόνη και υπολογιστής σε ένα. GRADE A-, 1 χρόνο εγγύηση.	Apple	\N	\N	f	\N
134	Apple iMac 21.5" A1418 Late 2013 Intel i5 GRADE B	Μεταχειρισμένος All-in-One υπολογιστής, 120GB SSD, 16GB DDR3, GRADE B	241.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-app-imac-l13-b-b.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	apple-imac-21-5-a1418-late-2013-i5-grade-b	\N	Apple iMac 21.5" A1418 (Late 2013) με Intel Core i5, 120GB SSD, 16GB DDR3 RAM. All-in-One σχεδίαση. GRADE B — καλή κατάσταση με ελαφριές αισθητικές φθορές. 1 χρόνο εγγύηση.	Apple	\N	\N	f	\N
135	Apple iMac 21.5" A1418 Late 2015 Intel i5 GRADE B	Μεταχειρισμένος All-in-One υπολογιστής, 120GB SSD, 8GB DDR3, GRADE B	273.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-app-imac-l15-b-b.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	apple-imac-21-5-a1418-late-2015-i5-grade-b	\N	Apple iMac 21.5" A1418 (Late 2015) με Intel Core i5, 120GB SSD, 8GB DDR3 RAM. All-in-One σχεδίαση, νεότερο μοντέλο. GRADE B, 1 χρόνο εγγύηση.	Apple	\N	\N	f	\N
136	HP EliteOne 800 G5 AIO Intel i5-9500 GRADE A- (χωρίς TFT)	Μεταχειρισμένος All-in-One υπολογιστής, 240GB SSD M.2 NVMe, 16GB DDR4, GRADE A-	393.50	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-hp-800g5-aio-i5-a-c.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	hp-eliteone-800-g5-aio-i5-9500-grade-a-minus-no-tft	\N	HP EliteOne 800 G5 AIO με Intel Core i5-9500 (9η γενιά), 240GB SSD M.2 NVMe, 16GB DDR4 RAM. All-in-One, χωρίς οθόνη TFT. GRADE A-, 1 χρόνο εγγύηση.	HP	\N	\N	f	\N
137	HP EliteOne 800 G5 AIO Intel i5-9500 GRADE A- (με TFT)	Μεταχειρισμένος All-in-One υπολογιστής, 240GB SSD M.2 NVMe, 16GB DDR4, GRADE A-	418.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-hp-800g5-aio-i5-a-t.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	hp-eliteone-800-g5-aio-i5-9500-grade-a-minus-with-tft	\N	HP EliteOne 800 G5 AIO με Intel Core i5-9500 (9η γενιά), 240GB SSD M.2 NVMe, 16GB DDR4 RAM. All-in-One, συνοδεύεται με οθόνη TFT. GRADE A-, 1 χρόνο εγγύηση.	HP	\N	\N	f	\N
138	HP EliteOne 800 G5 AIO Intel i5-9500 GRADE A- (με case & TFT)	Μεταχειρισμένος All-in-One υπολογιστής, 240GB SSD M.2 NVMe, 16GB DDR4, GRADE A-	418.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-hp-800g5-aio-i5-a-c-t.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	hp-eliteone-800-g5-aio-i5-9500-grade-a-minus-case-tft	\N	HP EliteOne 800 G5 AIO με Intel Core i5-9500 (9η γενιά), 240GB SSD M.2 NVMe, 16GB DDR4 RAM. Πλήρες σετ με case και οθόνη TFT. GRADE A-, 1 χρόνο εγγύηση.	HP	\N	\N	f	\N
139	HP EliteOne 800 G5 AIO Intel i5-9500 GRADE B	Μεταχειρισμένος All-in-One υπολογιστής, 240GB SSD M.2 NVMe, 16GB DDR4, GRADE B	379.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-hp-800g5-aio-i5-b-ct.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	hp-eliteone-800-g5-aio-i5-9500-grade-b	\N	HP EliteOne 800 G5 AIO με Intel Core i5-9500 (9η γενιά), 240GB SSD M.2 NVMe, 16GB DDR4 RAM. All-in-One, πλήρες σετ. GRADE B, 1 χρόνο εγγύηση.	HP	\N	\N	f	\N
140	HP EliteOne 800 G5 AIO Intel i7-8700 GRADE B	Μεταχειρισμένος All-in-One υπολογιστής, 240GB SSD M.2 NVMe, 8GB DDR4, GRADE B	401.50	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-hp-800g5-aio-i5-b-usb.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	hp-eliteone-800-g5-aio-i7-8700-grade-b	\N	HP EliteOne 800 G5 AIO με Intel Core i7-8700 (8η γενιά), 240GB SSD M.2 NVMe, 8GB DDR4 RAM. All-in-One με ισχυρό i7 επεξεργαστή. GRADE B, 1 χρόνο εγγύηση.	HP	\N	\N	f	\N
141	DELL Optiplex 3040 Intel Pentium G4400 SFF GRADE A	Μεταχειρισμένος υπολογιστής, 240GB SSD, 8GB DDR3, GRADE A	111.50	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-dl-3040-s-g4400.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	dell-optiplex-3040-pentium-g4400-sff-grade-a	\N	DELL Optiplex 3040 με Intel Pentium G4400, 240GB SSD, 8GB DDR3 RAM. Οικονομική επιλογή για απλές εργασίες γραφείου. Μορφή SFF. GRADE A, 1 χρόνο εγγύηση.	DELL	\N	\N	f	\N
142	HP RP5800 Intel i3-2120 SFF GRADE A	Μεταχειρισμένος υπολογιστής, 500GB HDD, 4GB DDR3, GRADE A	47.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-hp-rp5800-s-i3.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	hp-rp5800-i3-2120-sff-grade-a	\N	HP RP5800 με Intel Core i3-2120, 500GB HDD, 4GB DDR3 RAM. Επαγγελματικό μοντέλο POS/SFF σε εξαιρετική κατάσταση. GRADE A, 1 χρόνο εγγύηση.	HP	\N	\N	f	\N
143	DELL Optiplex 3040 Intel i3-6100 SFF GRADE A	Μεταχειρισμένος υπολογιστής, 240GB SSD, 8GB DDR3, GRADE A	112.00	https://www.reused.gr/media/catalog/product/cache/5ef474f1b2cd4f6b4aa8e007233ff498/p/c/pcr-dl-3040-s-i3.jpg	desktop	2026-03-06 09:57:24.037165	desktop	\N	dell-optiplex-3040-i3-6100-sff-grade-a	\N	DELL Optiplex 3040 με Intel Core i3-6100, 240GB SSD, 8GB DDR3 RAM. Αξιόπιστη οικονομική επιλογή για γραφείο σε μορφή SFF. GRADE A, 1 χρόνο εγγύηση.	DELL	\N	\N	f	\N
25	Samsung Galaxy A17 4G 128GB Black	Samsung Galaxy A17 4G 128GB, Black. Smartphone.	158	https://d.scdn.gr/images/sku_main_images/063015/63015056/xlarge_20250915123740_samsung_galaxy_a17_4g_dual_sim_4gb_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a17-4g-128gb-black	\N	\N	Samsung	Black	128GB	f	\N
26	Samsung Galaxy A17 4G 256GB Gray	Samsung Galaxy A17 4G 256GB, Gray. Smartphone.	190	https://d.scdn.gr/images/sku_main_images/063015/63015056/xlarge_20250915123740_samsung_galaxy_a17_4g_dual_sim_4gb_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a17-4g-256gb-gray	\N	\N	Samsung	Gray	256GB	f	\N
27	Samsung Galaxy A17 4G 256GB Blue	Samsung Galaxy A17 4G 256GB, Blue. Smartphone.	190	https://d.scdn.gr/images/sku_main_images/063015/63015056/xlarge_20250915123740_samsung_galaxy_a17_4g_dual_sim_4gb_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a17-4g-256gb-blue	\N	\N	Samsung	Blue	256GB	f	\N
28	Samsung Galaxy A17 4G 256GB Black	Samsung Galaxy A17 4G 256GB, Black. Smartphone.	190	https://d.scdn.gr/images/sku_main_images/063015/63015056/xlarge_20250915123740_samsung_galaxy_a17_4g_dual_sim_4gb_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a17-4g-256gb-black	\N	\N	Samsung	Black	256GB	f	\N
32	Samsung Galaxy A17 5G 256GB Black	Samsung Galaxy A17 5G 256GB, Black. Smartphone.	217	https://a.scdn.gr/images/sku_main_images/062516/62516909/xlarge_20250922161531_samsung_galaxy_a17_5g_dual_sim_4_128gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a17-5g-256gb-black	\N	\N	Samsung	Black	256GB	f	\N
33	Samsung Galaxy A26 5G 128GB Black	Samsung Galaxy A26 5G 128GB, Black. Smartphone.	211	https://d.scdn.gr/images/sku_main_images/059363/59363684/xlarge_20250321104230_samsung_galaxy_a26_5g_dual_sim_6gb_128gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a26-5g-128gb-black	\N	\N	Samsung	Black	128GB	f	\N
34	Samsung Galaxy A26 5G 128GB White	Samsung Galaxy A26 5G 128GB, White. Smartphone.	211	https://d.scdn.gr/images/sku_main_images/059363/59363684/xlarge_20250321104230_samsung_galaxy_a26_5g_dual_sim_6gb_128gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a26-5g-128gb-white	\N	\N	Samsung	White	128GB	f	\N
35	Samsung Galaxy A26 5G 128GB Mint	Samsung Galaxy A26 5G 128GB, Mint. Smartphone.	211	https://d.scdn.gr/images/sku_main_images/059363/59363684/xlarge_20250321104230_samsung_galaxy_a26_5g_dual_sim_6gb_128gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a26-5g-128gb-mint	\N	\N	Samsung	Mint	128GB	f	\N
38	Samsung Galaxy A36 5G 256GB Awesome White	Samsung Galaxy A36 5G 256GB, Awesome White. Smartphone.	285	https://c.scdn.gr/images/sku_main_images/059321/59321064/xlarge_20250319165639_samsung_galaxy_a36_5g_dual_sim_6gb_128gb_awesome_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	samsung-galaxy-a36-5g-256gb-awesome-white	\N	\N	Samsung	Awesome White	256GB	f	\N
42	Redmi 15C 128GB Blue	Redmi 15C 128GB, Blue. Smartphone.	131	https://c.scdn.gr/images/sku_main_images/062983/62983524/xlarge_20250916114737_xiaomi_redmi_15c_nfc_5g_dual_sim_4_256gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15c-128gb-blue	\N	\N	Redmi	Blue	128GB	f	\N
43	Redmi 15C 128GB Green	Redmi 15C 128GB, Green. Smartphone.	131	https://c.scdn.gr/images/sku_main_images/062983/62983524/xlarge_20250916114737_xiaomi_redmi_15c_nfc_5g_dual_sim_4_256gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15c-128gb-green	\N	\N	Redmi	Green	128GB	f	\N
44	Redmi 15C 256GB Black	Redmi 15C 256GB, Black. Smartphone.	151	https://c.scdn.gr/images/sku_main_images/062983/62983524/xlarge_20250916114737_xiaomi_redmi_15c_nfc_5g_dual_sim_4_256gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15c-256gb-black	\N	\N	Redmi	Black	256GB	f	\N
45	Redmi 15C 256GB Blue	Redmi 15C 256GB, Blue. Smartphone.	151	https://c.scdn.gr/images/sku_main_images/062983/62983524/xlarge_20250916114737_xiaomi_redmi_15c_nfc_5g_dual_sim_4_256gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15c-256gb-blue	\N	\N	Redmi	Blue	256GB	f	\N
46	Redmi 15C 256GB Green	Redmi 15C 256GB, Green. Smartphone.	151	https://c.scdn.gr/images/sku_main_images/062983/62983524/xlarge_20250916114737_xiaomi_redmi_15c_nfc_5g_dual_sim_4_256gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15c-256gb-green	\N	\N	Redmi	Green	256GB	f	\N
47	Redmi 15C 5G 128GB Black	Redmi 15C 5G 128GB, Black. Smartphone.	149	https://c.scdn.gr/images/sku_main_images/062983/62983524/xlarge_20250916114737_xiaomi_redmi_15c_nfc_5g_dual_sim_4_256gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15c-5g-128gb-black	\N	\N	Redmi	Black	128GB	f	\N
48	Redmi 15C 5G 256GB Black	Redmi 15C 5G 256GB, Black. Smartphone.	160	https://c.scdn.gr/images/sku_main_images/062983/62983524/xlarge_20250916114737_xiaomi_redmi_15c_nfc_5g_dual_sim_4_256gb_mayro.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15c-5g-256gb-black	\N	\N	Redmi	Black	256GB	f	\N
53	Redmi 15 NFC 4G 256GB Titanium	Redmi 15 NFC 4G 256GB, Titanium. Smartphone.	164	https://b.scdn.gr/images/sku_main_images/062042/62042146/xlarge_20250806112755_xiaomi_redmi_15_nfc_5g_dual_sim_8gb_256gb_titan_gray.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15-nfc-4g-256gb-titanium	\N	\N	Redmi	Titanium	256GB	f	\N
54	Redmi 15 NFC 5G 128GB Black	Redmi 15 NFC 5G 128GB, Black. Smartphone.	175	https://b.scdn.gr/images/sku_main_images/062042/62042146/xlarge_20250806112755_xiaomi_redmi_15_nfc_5g_dual_sim_8gb_256gb_titan_gray.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15-nfc-5g-128gb-black	\N	\N	Redmi	Black	128GB	f	\N
55	Redmi 15 NFC 5G 128GB Titanium	Redmi 15 NFC 5G 128GB, Titanium. Smartphone.	175	https://b.scdn.gr/images/sku_main_images/062042/62042146/xlarge_20250806112755_xiaomi_redmi_15_nfc_5g_dual_sim_8gb_256gb_titan_gray.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	redmi-15-nfc-5g-128gb-titanium	\N	\N	Redmi	Titanium	128GB	f	\N
98	Apple iPhone 17 256GB Sage	Apple iPhone 17 256GB, Sage. Smartphone.	800	https://d.scdn.gr/images/sku_main_images/062972/62972550/xlarge_20250910132335_apple_iphone_17_8gb_256gb_black.jpeg	mobile	2026-03-06 00:41:23.930333	\N	\N	apple-iphone-17-256gb-sage	\N	\N	Apple	Sage	256GB	f	\N
\.


--
-- Data for Name: repair_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_items (id, repair_request_id, description, amount, created_at) FROM stdin;
1	2	Φύλαξη μπροστινός οθόνης	15.00	2026-03-04 00:43:28.603403
2	1	Αλλαγή οθόνης	50.00	2026-03-04 00:43:52.476491
\.


--
-- Data for Name: repair_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_requests (id, first_name, last_name, phone, email, device_name, serial_number, device_code, notes, status, created_at, price, price_includes_vat) FROM stdin;
1	Γιώργης	Παπαδόπουλος	6912345678	giorges@test.com	iPhone 15 Pro Max	F4GT789ABC12			in-progress	2026-03-03 23:36:47.223808	20.00	f
2	Γρηγόρης	Παπαδόπουλος	6981882005	rebelmobile@gmail.com	iphone 14 pro max	7878t7tggvi7787	1234	Εδώ περιγράφω το πρόβλημα που έχει το κινητό	pending	2026-03-03 23:37:10.476472	45.00	f
3	testianos	xoris fpa	6981882005	rebelmobile@gmail.com	iPhone 17 Pro Max	45463637383838	1234	Πρέπει να είναι χωρίς ΦΠΑ 100 € το ποσό 	pending	2026-03-05 16:45:34.029172	100.00	f
4	testianos	me fpa	6981882005	rebelmobile@gmail.com	iPhone 17 	45463637383838	1234	Πρέπει να είναι χωρίς ΦΠΑ 124 € το ποσό 	pending	2026-03-05 16:46:25.404709	100.00	f
5	Νίκος	Δρογώσης	6944580996	jyygfkfgku@mail.com	ip	897987yo8	5555	me fpa	pending	2026-03-05 17:02:29.584292	100.00	f
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, customer_name, email, phone, type, start_date, renewal_date, price, status, notes, notified_month_before, notified_ten_days_before, created_at, antivirus_name) FROM stdin;
\.


--
-- Data for Name: website_inquiries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.website_inquiries (id, first_name, last_name, phone, email, prepayment, prepayment_includes_vat, notes, status, created_at) FROM stdin;
1	Γιώργος	Παπαδόπουλος	6912345678	test@test.com	\N	t	\N	pending	2026-03-11 12:36:03.580773
\.


--
-- Name: admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_users_id_seq', 1, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 5, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 4, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 2, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 113, true);


--
-- Name: repair_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_items_id_seq', 2, true);


--
-- Name: repair_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_requests_id_seq', 5, true);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 1, false);


--
-- Name: website_inquiries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.website_inquiries_id_seq', 1, true);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: repair_items repair_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_items
    ADD CONSTRAINT repair_items_pkey PRIMARY KEY (id);


--
-- Name: repair_requests repair_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: website_inquiries website_inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.website_inquiries
    ADD CONSTRAINT website_inquiries_pkey PRIMARY KEY (id);


--
-- Name: admin_users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admin_users_email_idx ON public.admin_users USING btree (email);


--
-- Name: customers_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customers_email_idx ON public.customers USING btree (email);


--
-- PostgreSQL database dump complete
--

\unrestrict ITn0OZkdyJardDuLAvUsbnaBLTRVfPXt6vGKg2bm3IYMB5A14sL2cGspBrkMdC1

