export const staticData = {
    personalInfo: {
        fullName: "Kamil Wróbel",
        role: "Grafik 3D",
        email: "wrobel.k@icloud.com",
        phone: "501-608-599",
        portfolio: "kamilwrobel.netlify.app",
        linkedin: "linkedin.com/in/kamil-wróbel-28932923a",
        location: "Łódź, Polska",
        photoUrl: "/profilowe/photo.jpg",
    },
    education: [
        {
            school: "Akademia Humanistyczno-Ekonomiczna",
            degree: "Magister sztuki, spec. projektowanie graficzne i fotografia",
            year: "2025 - 2027",
            description: ""
        },
        {
            school: "Akademia Humanistyczno-Ekonomiczna",
            degree: "Inżynier informatyki",
            year: "2025 - 2029",
            description: ""
        },
        {
            school: "Społeczna Akademia Nauk w Łodzi",
            degree: "Licencjat grafiki spec. projektowanie gier i VFX",
            year: "2022 - 2025",
            description: "Praca dyplomowa oceniona na 5 z wyróżnieniem."
        },
        {
            school: "ZSP w Krośnie Odrzańskim",
            degree: "Technik fotografii i multimediów",
            year: "2018 - 2022",
            description: ""
        }
    ],
    skills: [
        "Blender",
        "3ds Max",
        "Adobe Photoshop",
        "Adobe Illustrator",
        "Adobe InDesign",
        "Adobe After Effects",
        "Corel DRAW",
        "Unreal Engine 5",
        "Substance Painter" // Kept from previous list as it matches context
    ],
    languages: [
        "Polski (Ojczysty)",
        "Angielski (B2)"
    ],
    courses: [
        {
            name: "After Effects",
            year: "2023",
            image: "KURS AFTER.svg"
        },
        {
            name: "Illustrator",
            year: "2022",
            image: "KURS ILLUSTRATOR.svg"
        },
        {
            name: "3ds Max",
            year: "2021",
            image: "kurs 3dsmax.svg"
        }
    ],
    // Master List of Experience (The "Memory" of the system)
    masterExperience: [
        {
            company: "SenseVR Sp. z o.o.",
            role: "3D Modeler",
            period: "11.2025 - Obecnie",
            description: `Modeluję budynki na podstawie Google 3D tiles oraz OSM.
Opracowuję złożone systemy geometry nodes.
Tworzę skrypty oraz kompletne add-on’y na potrzeby automatyzacji pracy w blenderze.
Optymalizuję modele 3D na potrzeby projektów w Unreal Engine.`
        },
        {
            company: "OLV Sp. z o.o.",
            role: "Główny Grafik Techniczny",
            period: "06.2023 - 10.2025",
            description: `Projektowałem kolekcje marki OLAVOGA oraz materiały marketingowe i sprzedażowe.
Wykonywałem wizualizacje odzieży 3D.
Katalogowałem i tworzyłem dokumentację techniczną zaprojektowanych kolekcji.
Tworzyłem interaktywne wizualizacje 3D obuwia na potrzeby strony internetowej.
Programowałem i wdrażałem nowe rozwiązania automatyzacji produkcji (systemy webowe oraz aplikacje desktopowe).`
        }
    ],
    // Default/Initial dynamic data (can be overwritten by AI)
    summary: "Jestem grafikiem zajmującym się tworzeniem grafiki 2D i 3D, animacji oraz modeli do projektów cyfrowych. Pracuję głównie w Blenderze oraz narzędziach Adobe CC, dbając o poprawny workflow i jakość wykonania. W swojej pracy przygotowuję assety z myślą o ich dalszym wykorzystaniu w środowiskach czasu rzeczywistego, w tym w silniku Unreal Engine.",
    experience: [] // Initially empty, will be filled by AI or defaults
};

// Initialize experience with top 2 items for default view
staticData.experience = staticData.masterExperience.slice(0, 2);
