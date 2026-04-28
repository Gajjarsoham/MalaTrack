# 🪬 Laddu Gopal Mala – Business Manager

A complete business management web app for your Mala-making business.

---

## 📁 Project Structure

```
mala-business/
├── backend/         ← Python FastAPI (API Server)
│   ├── main.py
│   ├── requirements.txt
│   ├── schema.sql
│   └── .env.example
└── frontend/        ← React App (Website)
    ├── src/
    ├── public/
    └── package.json
```

---

## 🛠️ SETUP GUIDE (Step by Step)

### Step 1: Install MySQL

Download MySQL from: https://dev.mysql.com/downloads/installer/
- Install it and set a root password (remember this!)

### Step 2: Create Database

Open MySQL Workbench or MySQL command line and run:
```sql
-- Copy the content of backend/schema.sql and run it
```
Or run: `mysql -u root -p < backend/schema.sql`

### Step 3: Setup Backend (Python)

```bash
# Install Python 3.10+ from https://python.org if not already installed

# Go to backend folder
cd backend

# Copy env file and edit it
cp .env.example .env
# Edit .env file with your MySQL password and admin credentials

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will run at: http://localhost:8000

### Step 4: Setup Frontend (React)

```bash
# Install Node.js from https://nodejs.org if not already installed

# Go to frontend folder  
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Run the development server
npm start
```

Frontend will open at: http://localhost:3000

---

## 🔐 Default Login

- **Username:** admin
- **Password:** admin123

⚠️ IMPORTANT: Change these in `backend/.env` before using!

---

## 🌐 Deployment Options

### Option A: Run on Local Computer (Easiest)
Just follow setup above. Access from any device on same WiFi:
- Find your computer's IP: run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Access from phone: `http://192.168.X.X:3000`

### Option B: Deploy to Cloud (Render.com - Free)

#### Backend on Render:
1. Push code to GitHub
2. Go to render.com → New → Web Service
3. Connect your GitHub repo
4. Set:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables from your `.env` file
6. Use Render's free MySQL add-on or PlanetScale (free MySQL cloud)

#### Frontend on Netlify/Vercel:
1. Build the frontend: `npm run build`
2. Upload the `build/` folder to Netlify (drag & drop at netlify.com)
3. Set environment variable: `REACT_APP_API_URL` = your Render backend URL

### Option C: VPS/Server Deployment
Use nginx + PM2 + MySQL on any VPS (DigitalOcean, etc.)

---

## 📱 Features

### Dashboard
- Total workers and sellers count
- Total malas made and sold
- Total revenue, making cost, and net profit
- Pending payments to workers

### Workers (Karigar) Page
- Add workers with name, city, phone
- Click any worker to see their full records
- Add mala receipts: date, number, pattern, price per piece
- Auto-calculates total amount
- Mark payments as Paid/Pending
- Shows pending balance per worker

### Sellers (Wholesaler) Page  
- Add sellers with name, city, phone
- Click any seller to see sales history
- Add sales: date, malas sold, pattern, sell price, making cost
- Auto-calculates profit (sell price - making cost) × quantity
- Track payment received

---

## 🔧 Customization

- Change admin password: Edit `backend/.env`
- Add more fields: Edit `backend/schema.sql` + `backend/main.py`
- Change app colors: Edit `frontend/src/index.css` (CSS variables at top)

---

## ❓ Common Issues

**Backend won't start:**
- Check MySQL is running
- Check `.env` has correct DB password

**Frontend shows API error:**
- Make sure backend is running at port 8000
- Check `REACT_APP_API_URL` in frontend `.env`

**Can't login:**
- Use credentials from `backend/.env`
- Default: admin / admin123
