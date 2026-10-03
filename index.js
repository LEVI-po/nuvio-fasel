const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());

// مفتاح الحماية الخاص بك (API Key) للـ Backend
const BACKEND_API_KEY = process.env.API_KEY || "nuvio_fasel_secret_2026";

// ميدلوير للتحقق من مفتاح الـ API
const verifyApiKey = (req, res, next) => {
    const clientKey = req.headers['x-api-key'] || req.query.apikey;
    if (!clientKey || clientKey !== BACKEND_API_KEY) {
        return res.status(401).json({ error: "Unauthorized: Invalid or Missing API Key" });
    }
    next();
};

// مسار الـ Manifest (لكي يتعرف عليه تطبيق Nuvio)
app.get('/manifest.json', (req, res) => {
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${protocol}://${host}`;

    res.json({
        manifestVersion: "1.0.0",
        id: "com.faselhd.nuvio",
        name: "فاصل إعلاني - FaselHD",
        version: "1.0.0",
        description: "إضافة فاصل إعلاني لمشاهدة الأفلام والمسلسلات عبر تطبيق Nuvio",
        icon: "https://www.faselhd.run/wp-content/uploads/fav.png",
        types: ["movie", "series"],
        catalogs: [
            { type: "movie", id: "fasel_movies", name: "أفلام فاصل إعلاني" },
            { type: "series", id: "fasel_series", name: "مسلسلات فاصل إعلاني" }
        ],
        resources: ["catalog", "meta", "stream"],
        idPrefixes: ["fasel_"],
        baseUrl: `${baseUrl}/api`
    });
});

// مسار الكتالوج (جلب الأفلام والمسلسلات)
app.get('/api/catalog/:type/:id', verifyApiKey, async (req, res) => {
    try {
        res.json({ metas: [] });
    } catch (error) {
        res.status(500).json({ error: "Error fetching catalog" });
    }
});

// مسار التفاصيل والحلقات
app.get('/api/meta/:type/:id', verifyApiKey, async (req, res) => {
    try {
        const mediaId = req.params.id;
        res.json({ meta: { id: mediaId, name: "عنصر فاصل إعلاني", videos: [] } });
    } catch (error) {
        res.status(500).json({ error: "Error fetching meta" });
    }
});

// مسار التشغيل (جلب روابط السيرفرات المباشرة)
app.get('/api/stream/:type/:id', verifyApiKey, async (req, res) => {
    try {
        res.json({ streams: [] });
    } catch (error) {
        res.status(500).json({ error: "Error fetching streams" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
