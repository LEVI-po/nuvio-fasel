const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");
const cheerio = require("cheerio");

const FASEL_URL = "https://www.fasel.im";

const builder = new addonBuilder({
    id: "org.nuvio.faselhd",
    version: "1.0.0",
    name: "فاصل إعلاني",
    description: "إضافة فاصل إعلاني لمشاهدة الأفلام والمسلسلات العربية والأجنبية",
    resources: ["catalog", "meta", "stream"],
    types: ["movie", "series"],
    catalogs: [
        { type: "movie", id: "fasel_movies", name: "فاصل - أحدث الأفلام" },
        { type: "series", id: "fasel_series", name: "فاصل - أحدث المسلسلات" }
    ],
    idPrefixes: ["fasel_"]
});

// دالة لجلب الأفلام أو المسلسلات من الصفحة الرئيسية أو الأقسام
async function scrapeCatalog(type) {
    try {
        let url = type === "movie" ? `${FASEL_URL}/movies` : `${FASEL_URL}/series`;
        const response = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        });
        const $ = cheerio.load(response.data);
        let items = [];

        $("div.postDiv").each((_, element) => {
            const title = $(element).find("a").attr("title") \vert{}\vert{} $(element).find("h2").text().trim();
            const link = $(element).find("a").attr("href");
            const poster = $(element).find("img").attr("data-src") \vert{}\vert{} $(element).find("img").attr("src");

            if (link && title) {
                const idCode = link.split("/").filter(Boolean).pop();
                items.push({
                    id: `fasel_${idCode}`,
                    type: type,
                    name: title,
                    poster: poster,
                    posterShape: "poster"
                });
            }
        });
        return items;
    } catch (e) {
        console.error("Error scraping catalog:", e);
        return [];
    }
}

builder.defineCatalogHandler(async ({ type }) => {
    const items = await scrapeCatalog(type);
    return { metas: items };
});

builder.defineMetaHandler(async ({ id }) => {
    try {
        const idCode = id.replace("fasel_", "");
        const url = `${FASEL_URL}/${idCode}/`; // تعديل طفيف حسب رابط العمل
        // كود افتراضي لجلب تفاصيل العمل
        return {
            meta: {
                id: id,
                type: id.includes("series") ? "series" : "movie",
                name: "عرض فاصل",
                poster: "",
                description: "محتوى مستخرج من موقع فاصل إعلاني"
            }
        };
    } catch (e) {
        return { meta: null };
    }
});

builder.defineStreamHandler(async ({ id }) => {
    // روابط تجريبية أو حقيقية للمشاهدة
    return {
        streams: [
            {
                title: "فاصل إعلاني - سيرفر رئيسي",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            }
        ]
    };
});

module.exports = builder.getInterface();
