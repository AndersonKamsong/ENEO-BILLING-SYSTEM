// scripts/seed.js
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eneo_billing');

// Meter Schema
const meterSchema = new mongoose.Schema({
    meterNumber: { type: String, required: true, unique: true },
    tariff: { type: String, required: true },
    rate: { type: Number, required: true },
    debt: { type: Number, default: 0 },
    ownerName: String,
    address: String,
    createdAt: { type: Date, default: Date.now }
});

const Meter = mongoose.model('Meter', meterSchema);

async function seedDatabase() {
    try {
        // Clear existing data
        await Meter.deleteMany({});
        console.log('Cleared existing meter data');

        // Sample meters
        const sampleMeters = [
    {
        meterNumber: '12345678',
        tariff: 'residential',
        rate: 79.36,
        debt: 5000,
        ownerName: 'John Doe',
        address: 'Yaoundé, Centre'
    },
    {
        meterNumber: '87654321',
        tariff: 'commercial',
        rate: 95.23,
        debt: 0,
        ownerName: 'ABC Store',
        address: 'Douala, Littoral'
    },
    {
        meterNumber: '11111111',
        tariff: 'industrial',
        rate: 85.67,
        debt: 15000,
        ownerName: 'XYZ Factory',
        address: 'Bafoussam, Ouest'
    },
    {
        meterNumber: '22222222',
        tariff: 'residential',
        rate: 79.36,
        debt: 2500,
        ownerName: 'Jane Smith',
        address: 'Garoua, Nord'
    },
    // Yaoundé - Residential
    {
        meterNumber: '23701001',
        tariff: 'residential',
        rate: 79.36,
        debt: 0,
        ownerName: 'Alain Mbarga',
        address: 'Bastos, Yaoundé'
    },
    {
        meterNumber: '23701002',
        tariff: 'residential',
        rate: 79.36,
        debt: 2500,
        ownerName: 'Marie Fomo',
        address: 'Mvan, Yaoundé'
    },
    {
        meterNumber: '23701003',
        tariff: 'residential',
        rate: 79.36,
        debt: 1200,
        ownerName: 'Paul Nkomo',
        address: 'Ngousso, Yaoundé'
    },
    {
        meterNumber: '23701004',
        tariff: 'residential',
        rate: 79.36,
        debt: 0,
        ownerName: 'Grace Ayuk',
        address: 'Emombo, Yaoundé'
    },
    {
        meterNumber: '23701005',
        tariff: 'residential',
        rate: 79.36,
        debt: 3750,
        ownerName: 'Jean Talla',
        address: 'Omnisport, Yaoundé'
    },
    // Douala - Commercial & Residential
    {
        meterNumber: '23702001',
        tariff: 'commercial',
        rate: 95.23,
        debt: 0,
        ownerName: 'Pharmacie du Wouri',
        address: 'Akwa, Douala'
    },
    {
        meterNumber: '23702002',
        tariff: 'commercial',
        rate: 95.23,
        debt: 5600,
        ownerName: 'Supermarché MAHIMA',
        address: 'Bonandjo, Douala'
    },
    {
        meterNumber: '23702003',
        tariff: 'residential',
        rate: 79.36,
        debt: 800,
        ownerName: 'Christelle Ngalle',
        address: 'Makepe, Douala'
    },
    {
        meterNumber: '23702004',
        tariff: 'commercial',
        rate: 95.23,
        debt: 0,
        ownerName: 'Restaurant Le Safoutier',
        address: 'Bonanjo, Douala'
    },
    {
        meterNumber: '23702005',
        tariff: 'residential',
        rate: 79.36,
        debt: 1900,
        ownerName: 'Boris Essomba',
        address: 'Bonapriso, Douala'
    },
    // Industrial - Major cities
    {
        meterNumber: '23703001',
        tariff: 'industrial',
        rate: 85.67,
        debt: 12000,
        ownerName: 'SOSUCAM Usine',
        address: 'Nkoteng'
    },
    {
        meterNumber: '23703002',
        tariff: 'industrial',
        rate: 85.67,
        debt: 0,
        ownerName: 'ALUCAM Edéa',
        address: 'Edéa'
    },
    {
        meterNumber: '23703003',
        tariff: 'industrial',
        rate: 85.67,
        debt: 25000,
        ownerName: 'CIMENCAM',
        address: 'Figuil'
    },
    // Bafoussam - Mixed
    {
        meterNumber: '23704001',
        tariff: 'residential',
        rate: 79.36,
        debt: 950,
        ownerName: 'Albert Kamga',
        address: 'Bafoussam Centre'
    },
    {
        meterNumber: '23704002',
        tariff: 'commercial',
        rate: 95.23,
        debt: 0,
        ownerName: 'Hôtel Continental',
        address: 'Bafoussam'
    },
    // Garoua - North Region
    {
        meterNumber: '23705001',
        tariff: 'residential',
        rate: 79.36,
        debt: 1500,
        ownerName: 'Ahmadou Bello',
        address: 'Garoua Centre'
    },
    {
        meterNumber: '23705002',
        tariff: 'commercial',
        rate: 95.23,
        debt: 3200,
        ownerName: 'Marché Central',
        address: 'Garoua'
    },
    // Bamenda - Northwest
    {
        meterNumber: '23706001',
        tariff: 'residential',
        rate: 79.36,
        debt: 0,
        ownerName: 'Mary Fon',
        address: 'Mile 4, Bamenda'
    },
    {
        meterNumber: '23706002',
        tariff: 'commercial',
        rate: 95.23,
        debt: 4100,
        ownerName: 'Bamenda Supermarket',
        address: 'Commercial Avenue, Bamenda'
    },
    // Maroua - Far North
    {
        meterNumber: '23707001',
        tariff: 'residential',
        rate: 79.36,
        debt: 2200,
        ownerName: 'Ibrahim Mahamat',
        address: 'Maroua Centre'
    },
    {
        meterNumber: '23707002',
        tariff: 'commercial',
        rate: 95.23,
        debt: 0,
        ownerName: 'Hôtel Sahel',
        address: 'Maroua'
    },
    // Bertoua - East Region
    {
        meterNumber: '23708001',
        tariff: 'residential',
        rate: 79.36,
        debt: 1750,
        ownerName: 'Sylvain Mballa',
        address: 'Bertoua Centre'
    },
    {
        meterNumber: '23708002',
        tariff: 'commercial',
        rate: 95.23,
        debt: 890,
        ownerName: 'Station Service TOTAL',
        address: 'Bertoua'
    },
    // Ebolowa - South Region
    {
        meterNumber: '23709001',
        tariff: 'residential',
        rate: 79.36,
        debt: 0,
        ownerName: 'Françoise Mebada',
        address: 'Ebolowa Centre'
    },
    {
        meterNumber: '23709002',
        tariff: 'commercial',
        rate: 95.23,
        debt: 2750,
        ownerName: 'Pharmacie de la Paix',
        address: 'Ebolowa'
    }
];

        // Insert sample data
        await Meter.insertMany(sampleMeters);
        console.log('✅ Database seeded successfully!');
        console.log('Sample meter numbers to test:');
        sampleMeters.forEach(meter => {
            console.log(`- ${meter.meterNumber} (${meter.tariff}, debt: ${meter.debt} FCFA)`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedDatabase();