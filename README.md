# Genshin Import Backend

A backend API service for the Genshin Import project, built with Node.js and Express.

---

##  Prerequisites

Make sure you have the following installed before getting started:

- [Node.js]
- [XAMPP]

---

##  Getting Started

### 1. Install Dependencies

Navigate to the project root and run:

```bash
npm i
```

### 2. Configure Environment Variables

Copy the provided template and rename it to `.env`:

```bash
cp dotenvtemplate.txt genshin_import_api/.env
```

> Make sure the `.env` file is placed inside the `genshin_import_api` folder.

### 3. Start the Database & Server

1. Open **XAMPP Control Panel**
2. Start both **Apache** and **MySQL**

### 4. Run the Development Server

```bash
cd genshin-import-backend/genshin_import_api
npm run dev
```

---

## API Reference

A full list of available endpoints, parameters, request bodies, and responses can be found in the spreadsheet shared below:

[View API Endpoints Spreadsheet](https://docs.google.com/spreadsheets/d/1EToRbtVOs_gEEOPFvz4TMxPwWs_zsPEVNW07ao4n9G4/edit?usp=sharing)

---

##  Database Setup (Optional)

To populate the database with dummy data, import the `dummy.txt` SQL file into your MySQL database via **phpMyAdmin** or the MySQL CLI:

```bash
mysql -u root -p genshin_import < dummy.txt
```

---

##  Project Structure

```
genshin-import-backend/
├── genshin_import_api/
│   ├── .env               ← copied from dotenvtemplate.txt
│   └── ...
├── dotenvtemplate.txt
└── dummy.txt              ← optional SQL data dummy
```
