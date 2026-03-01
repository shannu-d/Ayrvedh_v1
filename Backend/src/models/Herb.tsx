import mongoose, { Document, Schema } from 'mongoose';

export interface IHealthBenefitGroup {
    groupName: string;
    detail: string;
}

export interface IDosageForm {
    form: string;   // Powder, Juice, Capsule, Tablet, Oil
    amount: string; // e.g. "3–5g with warm water once daily"
}

export interface IHerb extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    sanskritName: string;
    otherNames: string[];
    botanicalName: string;
    englishName: string;
    family: string;
    geographicOrigin: string;
    category: string[];
    description: string;

    // Ayurvedic properties
    taste: string[];        // Rasa
    guna: string[];         // Guna (Quality): Light, Heavy, Dry, Oily...
    energy: string;         // Virya: Hot / Cold
    vipaka: string;         // Post-digestive effect: Sweet / Sour / Pungent
    dosha: string[];        // Doshas it balances

    // Usage
    partUsed: string[];
    dosage: string;         // Summary string
    dosageForms: IDosageForm[];  // Structured per form

    // Clinical
    benefits: string[];
    healthBenefitGroups: IHealthBenefitGroup[];  // Grouped benefits for UI
    uses: string[];
    indications: string[];
    precautions: string[];
    contraindications: string[];
    storageInstructions: string[];

    image?: string;
    // ── Layer 3: Scientific Validation ──────────────────────────────────────
    researchBadge: boolean;          // Has peer-reviewed research backing
    activeCompounds: string[];       // e.g. ['Withanolides', 'Ginsenosides']
    pubmedLinks: string[];           // PubMed / research paper URLs
    // ── Layer 4: Multilingual Content (DB-stored) ────────────────────────────
    translations: {
        [langCode: string]: {
            description?: string;
            benefits?: string[];
            uses?: string[];
            indications?: string[];
            healthBenefitGroups?: { groupName: string; detail: string }[];
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

const herbSchema = new Schema<IHerb>(
    {
        name: { type: String, required: true, trim: true },
        sanskritName: { type: String, default: '', trim: true },
        otherNames: { type: [String], default: [] },
        botanicalName: { type: String, default: '' },
        englishName: { type: String, default: '' },
        family: { type: String, default: '' },
        geographicOrigin: { type: String, default: '' },
        category: { type: [String], required: true },
        description: { type: String, required: true },

        // Ayurvedic properties
        taste: { type: [String], default: [] },
        guna: { type: [String], default: [] },
        energy: { type: String, default: '' },
        vipaka: { type: String, default: '' },
        dosha: { type: [String], default: [] },

        // Usage
        partUsed: { type: [String], default: [] },
        dosage: { type: String, default: '' },
        dosageForms: {
            type: [{ form: String, amount: String }],
            default: [],
        },

        // Clinical
        benefits: { type: [String], default: [] },
        healthBenefitGroups: {
            type: [{ groupName: String, detail: String }],
            default: [],
        },
        uses: { type: [String], default: [] },
        indications: { type: [String], default: [] },
        precautions: { type: [String], default: [] },
        contraindications: { type: [String], default: [] },
        storageInstructions: { type: [String], default: [] },

        image: { type: String, default: '' },

        // ── Scientific Validation (Layer 3) ─────────────────────────────────
        researchBadge: { type: Boolean, default: false },
        activeCompounds: { type: [String], default: [] },
        pubmedLinks: { type: [String], default: [] },

        // ── Multilingual Content (Layer 4) ───────────────────────────────────
        // Map: { "te": { description, benefits, uses, ... }, "hi": {...}, ... }
        translations: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

herbSchema.index({ name: 'text', sanskritName: 'text', description: 'text', benefits: 'text' });

export const Herb = mongoose.model<IHerb>('Herb', herbSchema);
