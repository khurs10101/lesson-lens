import {
  Lesson,
  DyslexiaContent,
  ESLContent,
  VisualContent,
  AudioContent,
  ADHDContent,
  GiftedContent,
} from "@/types";

export const DEMO_LESSON_ID = "demo-water-cycle";

export const WATER_CYCLE_RAW_CONTENT = `The Water Cycle

The water cycle, also known as the hydrological cycle, describes the continuous movement of water on, above, and below Earth's surface.

Evaporation: When the sun heats water in oceans, lakes, and rivers, the water turns into water vapor and rises into the atmosphere. Approximately 502,800 cubic kilometers of water evaporate from Earth's surface each year.

Condensation: As water vapor rises, it cools and condenses around tiny dust particles to form clouds and fog. This process releases heat energy called latent heat.

Precipitation: When water droplets in clouds combine and grow heavy enough, they fall as precipitation — rain, snow, sleet, or hail — depending on atmospheric temperature.

Collection: Precipitation collects in oceans, rivers, lakes, and groundwater. Plants also absorb water through their roots in a process called transpiration.

The cycle then repeats continuously, driven by solar energy and gravity.`;

const dyslexiaContent: DyslexiaContent = {
  title: "The Water Cycle",
  sections: [
    {
      heading: "What Is the Water Cycle?",
      content:
        "Water moves in a big loop.\nIt goes up into the sky.\nThen it comes back down.\nThis loop never stops.\nThe sun and gravity keep it going.",
      keyTerms: ["water cycle", "loop"],
    },
    {
      heading: "Evaporation",
      content:
        "The sun heats up water.\nWater in lakes and seas gets warm.\nWarm water turns into gas.\nThis gas goes up into the air.\nWe call this **evaporation**.",
      keyTerms: ["evaporation", "gas", "water vapor"],
    },
    {
      heading: "Condensation",
      content:
        "The gas rises high up.\nIt gets cold up in the sky.\nCold gas turns into tiny drops.\nThese drops form **clouds**.\nWe call this **condensation**.",
      keyTerms: ["condensation", "clouds", "drops"],
    },
    {
      heading: "Precipitation",
      content:
        "Drops in clouds get big.\nBig drops are heavy.\nHeavy drops fall down.\nThis is called **precipitation**.\nRain and snow are precipitation.",
      keyTerms: ["precipitation", "rain", "snow"],
    },
    {
      heading: "Collection",
      content:
        "Water falls to the ground.\nIt fills rivers and lakes.\nSome goes into the soil.\nPlants drink it up.\nThen the loop starts again.",
      keyTerms: ["collection", "groundwater", "transpiration"],
    },
  ],
  glossary: [
    { term: "Water cycle", definition: "The way water moves in a loop from sky to ground and back" },
    { term: "Evaporation", definition: "When water turns into gas from heat" },
    { term: "Condensation", definition: "When gas turns into tiny water drops" },
    { term: "Precipitation", definition: "When water falls from clouds as rain or snow" },
    { term: "Collection", definition: "When water gathers in lakes, rivers, or soil" },
    { term: "Water vapor", definition: "Water in the form of gas" },
    { term: "Transpiration", definition: "When plants release water into the air" },
  ],
  readingLevel: "Grade 3",
};

const eslContent: ESLContent = {
  title: "The Water Cycle",
  targetLanguage: "Spanish",
  sections: [
    {
      heading: "What Is the Water Cycle?",
      englishContent:
        "The water cycle is the way water moves around Earth. Water goes up into the sky, forms clouds, falls as rain, and collects in rivers and oceans. Then it starts again. This never stops.",
      translatedContent:
        "El ciclo del agua es la forma en que el agua se mueve alrededor de la Tierra. El agua sube al cielo, forma nubes, cae como lluvia y se acumula en rios y oceanos. Luego comienza de nuevo. Esto nunca se detiene.",
      vocabularySpotlight: [
        {
          word: "water cycle",
          definition: "the continuous movement of water on Earth",
          translation: "ciclo del agua",
          exampleSentence: "The water cycle keeps our planet's water moving.",
        },
        {
          word: "continuous",
          definition: "something that never stops",
          translation: "continuo",
          exampleSentence: "The rain was continuous all day long.",
        },
      ],
    },
    {
      heading: "Evaporation",
      englishContent:
        "The sun heats water in oceans and lakes. The warm water turns into water vapor (a gas). This gas rises into the sky. This process is called evaporation.",
      translatedContent:
        "El sol calienta el agua en los oceanos y los lagos. El agua caliente se convierte en vapor de agua (un gas). Este gas sube al cielo. Este proceso se llama evaporacion.",
      vocabularySpotlight: [
        {
          word: "evaporation",
          definition: "when liquid water becomes gas because of heat",
          translation: "evaporacion",
          exampleSentence: "Evaporation happens faster on hot days.",
        },
        {
          word: "water vapor",
          definition: "water in the form of gas that you cannot see",
          translation: "vapor de agua",
          exampleSentence: "Water vapor rises from the lake into the air.",
        },
      ],
    },
    {
      heading: "Condensation",
      englishContent:
        "When water vapor goes high in the sky, it gets cold. Cold water vapor turns into tiny water drops. These drops stick to dust in the air and form clouds. This is called condensation.",
      translatedContent:
        "Cuando el vapor de agua sube alto en el cielo, se enfria. El vapor de agua frio se convierte en pequenas gotas de agua. Estas gotas se pegan al polvo en el aire y forman nubes. Esto se llama condensacion.",
      vocabularySpotlight: [
        {
          word: "condensation",
          definition: "when gas turns back into liquid drops",
          translation: "condensacion",
          exampleSentence: "You can see condensation on a cold glass of water.",
        },
        {
          word: "particles",
          definition: "very tiny pieces of something",
          translation: "particulas",
          exampleSentence: "Dust particles in the air help clouds form.",
        },
      ],
    },
    {
      heading: "Precipitation and Collection",
      englishContent:
        "Water drops in clouds get bigger and heavier. When they are too heavy, they fall as rain, snow, or hail. This is precipitation. The water collects in rivers, lakes, and oceans. Some water goes underground. Plants drink water from the soil. Then the cycle starts again.",
      translatedContent:
        "Las gotas de agua en las nubes se hacen mas grandes y pesadas. Cuando son demasiado pesadas, caen como lluvia, nieve o granizo. Esto es precipitacion. El agua se acumula en rios, lagos y oceanos. Algo de agua va bajo tierra. Las plantas beben agua del suelo. Luego el ciclo comienza de nuevo.",
      vocabularySpotlight: [
        {
          word: "precipitation",
          definition: "water falling from clouds (rain, snow, hail)",
          translation: "precipitacion",
          exampleSentence: "Heavy precipitation caused flooding in the city.",
        },
        {
          word: "collection",
          definition: "when water gathers in one place",
          translation: "acumulacion",
          exampleSentence: "Water collection happens in lakes and rivers.",
        },
        {
          word: "groundwater",
          definition: "water that is under the ground in soil and rocks",
          translation: "agua subterranea",
          exampleSentence: "Groundwater is important for drinking water.",
        },
      ],
    },
  ],
  translationNote:
    "This lesson has been simplified for CEFR A2-B1 English learners. Academic vocabulary is defined inline. Cultural references have been kept universal.",
};

const visualContent: VisualContent = {
  title: "The Water Cycle",
  conceptMap: {
    centralConcept: "Water Cycle",
    nodes: [
      {
        id: "1",
        concept: "Sun (Energy Source)",
        emoji: "☀️",
        description: "The sun provides heat energy that powers the entire water cycle by warming surface water.",
        connections: ["2"],
      },
      {
        id: "2",
        concept: "Evaporation",
        emoji: "💨",
        description: "Heat turns liquid water into water vapor that rises into the atmosphere. 502,800 km³ per year.",
        connections: ["3"],
      },
      {
        id: "3",
        concept: "Condensation",
        emoji: "☁️",
        description: "Water vapor cools at high altitudes, forming tiny droplets around dust particles to create clouds.",
        connections: ["4"],
      },
      {
        id: "4",
        concept: "Precipitation",
        emoji: "🌧️",
        description: "Droplets combine and grow heavy, falling as rain, snow, sleet, or hail depending on temperature.",
        connections: ["5"],
      },
      {
        id: "5",
        concept: "Collection",
        emoji: "🌊",
        description: "Water gathers in oceans, rivers, lakes, and underground aquifers. Plants absorb it via transpiration.",
        connections: ["2"],
      },
    ],
  },
  timeline: [
    {
      step: 1,
      event: "Solar Heating",
      description: "The sun warms water on Earth's surface — oceans, lakes, and rivers absorb solar energy.",
      emoji: "☀️",
    },
    {
      step: 2,
      event: "Evaporation",
      description: "Heated water molecules escape as invisible gas (water vapor) and rise into the atmosphere.",
      emoji: "💨",
    },
    {
      step: 3,
      event: "Rising & Cooling",
      description: "Water vapor rises to higher, cooler altitudes where temperatures drop significantly.",
      emoji: "⬆️",
    },
    {
      step: 4,
      event: "Condensation",
      description: "Cooled vapor condenses around dust particles, forming visible cloud droplets.",
      emoji: "☁️",
    },
    {
      step: 5,
      event: "Precipitation",
      description: "Cloud droplets merge until heavy enough to fall — as rain, snow, sleet, or hail.",
      emoji: "🌧️",
    },
    {
      step: 6,
      event: "Collection & Runoff",
      description: "Water flows into rivers, soaks into soil, fills lakes and oceans, and is absorbed by plants.",
      emoji: "🌊",
    },
  ],
  visualSections: [
    {
      heading: "The Big Picture",
      caption: "Water cycles endlessly between Earth's surface and atmosphere, powered by the sun.",
      diagramSuggestion: "Draw a circular arrow connecting ocean, sky, clouds, and ground",
    },
    {
      heading: "Energy In, Energy Out",
      caption: "Solar energy drives evaporation; latent heat is released during condensation.",
      diagramSuggestion: "Draw the sun with arrows pointing to water, and clouds releasing heat waves",
    },
    {
      heading: "Many Paths Down",
      caption: "Precipitation takes different forms: rain (warm), snow (cold), sleet (mixed), hail (storms).",
      diagramSuggestion: "Draw a cloud with four arrows showing rain, snow, sleet, and hail",
    },
  ],
};

const audioContent: AudioContent = {
  title: "The Water Cycle",
  estimatedDuration: "4 minutes",
  wordCount: 620,
  script: [
    {
      type: "intro",
      text: "Hey there! Today we're going to explore something really amazing — the water cycle. [PAUSE] Have you ever wondered where rain comes from? Or what happens to a puddle after the sun comes out? [PAUSE] Well, it's all connected in one big, beautiful loop that never stops. Let's dive in!",
    },
    {
      type: "section",
      sectionTitle: "Evaporation",
      text: "So here's where it all starts — with the [EMPHASIZE]sun[EMPHASIZE]. The sun is like a giant heater for our planet. When it shines on oceans, lakes, and rivers, it warms up the water. [PAUSE] And when water gets warm enough, something cool happens — it turns into an invisible gas called [EMPHASIZE]water vapor[EMPHASIZE]. This gas floats up, up, up into the sky. [PAUSE] Fun fact — about 502,800 cubic kilometers of water evaporate from Earth every single year. That's a LOT of water floating around above our heads!",
    },
    {
      type: "section",
      sectionTitle: "Condensation",
      text: "Now, as that water vapor rises higher and higher into the sky, something interesting happens. [PAUSE] It gets cold up there! And when water vapor gets cold, it does the opposite of evaporation — it turns back into tiny little water droplets. [PAUSE] These droplets are so tiny they stick to bits of dust floating in the air. And when billions of these droplets come together, guess what they form? [PAUSE] That's right — [EMPHASIZE]clouds[EMPHASIZE]! This whole process is called [EMPHASIZE]condensation[EMPHASIZE]. Pretty neat, right?",
    },
    {
      type: "section",
      sectionTitle: "Precipitation",
      text: "Okay, so now we've got clouds full of tiny water droplets. But those droplets don't stay tiny forever. [PAUSE] They bump into each other and merge, getting bigger and bigger. Eventually, they get so heavy that the cloud can't hold them anymore, and they fall! [PAUSE] When water falls from clouds, we call it [EMPHASIZE]precipitation[EMPHASIZE]. If it's warm, we get rain. If it's cold, we get snow. And sometimes we even get sleet or hail! [PAUSE] It all depends on the temperature of the air.",
    },
    {
      type: "section",
      sectionTitle: "Collection",
      text: "So where does all that water go after it falls? [PAUSE] Well, it collects everywhere! Some flows into rivers and streams. Some fills up lakes. A lot of it flows all the way back to the ocean. [PAUSE] And some of it soaks deep into the ground — we call that [EMPHASIZE]groundwater[EMPHASIZE]. Oh, and here's a bonus — plants get in on the action too! They absorb water through their roots and release some back into the air through their leaves. That's called [EMPHASIZE]transpiration[EMPHASIZE].",
    },
    {
      type: "recap",
      text: "So let's recap this amazing journey. [PAUSE] The sun heats water, and it evaporates into vapor. [PAUSE] The vapor rises, cools, and condenses into clouds. [PAUSE] Clouds release water as precipitation — rain, snow, or hail. [PAUSE] And that water collects in oceans, rivers, and underground — ready to start the whole cycle again. [PAUSE] And the most incredible part? This has been happening for billions of years and it never, ever stops. [PAUSE] The water you drank today might have once been in a dinosaur's lake. How cool is that?",
    },
  ],
};

const adhdContent: ADHDContent = {
  title: "The Water Cycle",
  bigPicture:
    "Water travels in an endless loop: sun heats it up, it rises as gas, forms clouds, falls as rain, and collects again. Repeat forever!",
  totalCards: 10,
  estimatedMinutes: 12,
  cards: [
    {
      cardNumber: 1,
      heading: "The Big Idea",
      content:
        "Water never gets created or destroyed — it just keeps moving! The same water dinosaurs drank is still here today, cycling through the sky and ground.",
      whyItMatters:
        "Everything alive needs water. Understanding the cycle shows how our planet recycles its most precious resource.",
      estimatedMinutes: 1,
      isQuizCard: false,
    },
    {
      cardNumber: 2,
      heading: "Step 1: Evaporation",
      content:
        "The sun heats oceans and lakes. Water turns into invisible gas (water vapor) and floats up into the sky. Over 500,000 cubic km evaporates every year!",
      whyItMatters:
        "Without evaporation, there would be no clouds and no rain. It's the engine that starts the whole cycle.",
      estimatedMinutes: 1,
      isQuizCard: false,
    },
    {
      cardNumber: 3,
      heading: "Step 2: Condensation",
      content:
        "High up in the sky, water vapor cools down. It turns back into tiny water droplets that cling to dust particles. Billions of droplets = clouds!",
      whyItMatters:
        "This is literally how clouds are made. Every cloud you see is condensation happening right now!",
      estimatedMinutes: 1,
      isQuizCard: false,
    },
    {
      cardNumber: 4,
      isQuizCard: true,
      question: "What happens to water vapor when it rises high and gets cold?",
      options: [
        "It disappears",
        "It turns into tiny droplets (condensation)",
        "It gets hotter",
      ],
      correctAnswer: "It turns into tiny droplets (condensation)",
      explanation:
        "Cold temperatures cause water vapor to condense into tiny liquid droplets — that's how clouds form!",
    },
    {
      cardNumber: 5,
      heading: "Step 3: Precipitation",
      content:
        "Tiny cloud droplets merge and grow bigger. When they're too heavy to float, they fall! Rain (warm), snow (cold), sleet, or hail — it depends on temperature.",
      whyItMatters:
        "Precipitation is how fresh water gets delivered to land. No precipitation = no rivers, no drinking water, no crops.",
      estimatedMinutes: 1,
      isQuizCard: false,
    },
    {
      cardNumber: 6,
      heading: "Step 4: Collection",
      content:
        "Fallen water flows into rivers, fills lakes, soaks into soil, and runs back to the ocean. Plants drink it through roots and release some back via transpiration.",
      whyItMatters:
        "Collection is where we get our water supply! Rivers, lakes, and underground aquifers all fill up during this stage.",
      estimatedMinutes: 1,
      isQuizCard: false,
    },
    {
      cardNumber: 7,
      isQuizCard: true,
      question: "What are the 4 main stages of the water cycle in order?",
      options: [
        "Evaporation, Condensation, Precipitation, Collection",
        "Rain, Snow, River, Ocean",
        "Heating, Cooling, Falling, Swimming",
      ],
      correctAnswer: "Evaporation, Condensation, Precipitation, Collection",
      explanation:
        "The four main stages flow in order: heat makes water evaporate, it condenses into clouds, falls as precipitation, and collects on the surface.",
    },
    {
      cardNumber: 8,
      heading: "Bonus: Transpiration",
      content:
        "Plants are secret water recyclers! They absorb water through roots and release water vapor through tiny pores in their leaves. This adds moisture back to the air.",
      whyItMatters:
        "Forests and plants play a huge role in the water cycle. Cutting down forests can actually change rainfall patterns!",
      estimatedMinutes: 1,
      isQuizCard: false,
    },
    {
      cardNumber: 9,
      heading: "The Never-Ending Loop",
      content:
        "The water cycle has been running for 4+ billion years! Solar energy and gravity keep it going. No water is lost — it just changes form and location.",
      whyItMatters:
        "Climate change is affecting this cycle — warmer temps mean more evaporation and more intense storms.",
      estimatedMinutes: 1,
      isQuizCard: false,
    },
    {
      cardNumber: 10,
      isQuizCard: true,
      question: "What two forces power the water cycle?",
      options: [
        "Wind and waves",
        "Solar energy and gravity",
        "The moon and tides",
      ],
      correctAnswer: "Solar energy and gravity",
      explanation:
        "The sun's heat drives evaporation, and gravity pulls precipitation back down to Earth. These two forces keep the entire cycle running!",
    },
  ],
};

const giftedContent: GiftedContent = {
  title: "The Water Cycle (Advanced)",
  prerequisiteCheck:
    "You should already know the basic stages: evaporation, condensation, precipitation, and collection.",
  deeperContext: [
    {
      angle: "Molecular Physics",
      content:
        "Evaporation occurs when individual water molecules at the liquid surface gain enough kinetic energy to escape into the gas phase. This happens even below boiling point — it's a statistical process where the fastest-moving molecules in the Boltzmann distribution break free from hydrogen bonds. The latent heat of vaporization for water is 2,260 kJ/kg, making it one of the highest of any common substance — this is why evaporative cooling is so effective.",
    },
    {
      angle: "Atmospheric Science",
      content:
        "Cloud formation requires cloud condensation nuclei (CCN) — aerosol particles around 0.2 micrometers. Without CCN, water vapor would need to reach ~400% relative humidity to condense spontaneously (homogeneous nucleation). This is why pollution can actually increase cloud formation, a phenomenon known as the Twomey effect, while simultaneously making rain drops smaller and reducing precipitation efficiency.",
    },
    {
      angle: "Climate Science",
      content:
        "The water cycle amplifies climate change through positive feedback: warmer air holds more water vapor (7% more per degree Celsius, per the Clausius-Clapeyron relation). Since water vapor is itself a greenhouse gas, this creates a feedback loop. The result: more intense but less frequent precipitation events, expanding dry zones, and shifting monsoon patterns. The water cycle is Earth's primary mechanism for redistributing heat from the equator to the poles.",
    },
    {
      angle: "Geological Time",
      content:
        "Earth's water has been cycling for approximately 3.8 billion years. The total amount of water has remained roughly constant, but its distribution has changed dramatically. During ice ages, enormous quantities were locked in glaciers, lowering sea levels by up to 120 meters. Today, about 97.5% of Earth's water is saline, 1.75% is frozen, and only 0.75% is accessible freshwater.",
    },
  ],
  realWorldApplications: [
    {
      application: "Desalination Engineering",
      description:
        "Engineers mimic evaporation and condensation to convert seawater to freshwater. Modern reverse osmosis plants can produce 1,000 liters of freshwater per 3 kWh, but thermal desalination literally recreates the water cycle in a factory.",
    },
    {
      application: "Weather Prediction",
      description:
        "Meteorologists model the water cycle using supercomputers that simulate atmospheric fluid dynamics. Understanding condensation rates, adiabatic cooling, and precipitation triggers is essential for weather forecasting accuracy.",
    },
    {
      application: "Urban Planning",
      description:
        "Cities must manage the collection stage through stormwater systems. Impervious surfaces (roads, buildings) disrupt natural collection, causing flash floods. Green infrastructure like rain gardens and permeable pavement restore natural water cycle processes.",
    },
  ],
  whatIfScenarios: [
    {
      scenario: "What if Earth had no axial tilt?",
      thinkingPrompt:
        "Without seasons, equatorial regions would receive constant intense heating while poles stayed permanently cold. How would this affect global evaporation and precipitation patterns? Would mid-latitudes become deserts?",
    },
    {
      scenario: "What if the water cycle operated on Titan (Saturn's moon)?",
      thinkingPrompt:
        "Titan has a methane cycle instead of a water cycle — methane rain, methane lakes, methane evaporation. The surface temperature is -179°C. How does having a different cycling fluid change the dynamics?",
    },
    {
      scenario: "What if all ice on Earth melted simultaneously?",
      thinkingPrompt:
        "There are about 26.5 million km³ of ice on Earth. If it all melted, sea levels would rise ~65 meters. But how would the sudden shift in albedo (reflectivity) and salinity alter the water cycle itself?",
    },
  ],
  socraticQuestions: [
    "If the water cycle redistributes heat from the equator to the poles, what would happen to global temperature gradients if the cycle suddenly stopped?",
    "Deforestation reduces transpiration. If the Amazon rainforest were completely cleared, how might precipitation patterns change not just locally but globally?",
    "Water's unusually high heat capacity makes it a climate stabilizer. If water had the heat capacity of ethanol instead, how would Earth's climate be different?",
  ],
  rabbitHole: {
    topic: "The Snowball Earth Hypothesis",
    searchTerms: [
      "Snowball Earth hypothesis",
      "Neoproterozoic glaciation",
      "carbon cycle water cycle interaction",
      "Huronian glaciation",
    ],
    suggestedResources: [
      "NASA Earth Observatory articles",
      "NOAA Climate.gov education resources",
      "PBS Eons YouTube videos on ice ages",
    ],
  },
  challengeActivity: {
    title: "Design a Water Cycle for Mars",
    description:
      "Mars has polar ice caps (water + CO2 ice) and evidence of ancient river channels. Using what you know about the water cycle and Mars conditions (low pressure, thin atmosphere, -60°C average temp), design what a theoretical Martian water cycle would look like. What stages would exist? What would be different? Draw a diagram and write a 200-word explanation.",
    estimatedTime: "30 minutes",
  },
};

export const DEMO_LESSON: Lesson = {
  id: DEMO_LESSON_ID,
  title: "The Water Cycle",
  fileName: "water-cycle-lesson.pdf",
  fileType: "pdf",
  originalContent: WATER_CYCLE_RAW_CONTENT,
  status: "ready",
  createdAt: new Date().toISOString(),
  adaptations: {
    dyslexia: {
      type: "dyslexia",
      content: dyslexiaContent,
      generatedAt: new Date().toISOString(),
      status: "ready",
    },
    esl: {
      type: "esl",
      content: eslContent,
      generatedAt: new Date().toISOString(),
      status: "ready",
    },
    visual: {
      type: "visual",
      content: visualContent,
      generatedAt: new Date().toISOString(),
      status: "ready",
    },
    audio: {
      type: "audio",
      content: audioContent,
      generatedAt: new Date().toISOString(),
      status: "ready",
    },
    adhd: {
      type: "adhd",
      content: adhdContent,
      generatedAt: new Date().toISOString(),
      status: "ready",
    },
    gifted: {
      type: "gifted",
      content: giftedContent,
      generatedAt: new Date().toISOString(),
      status: "ready",
    },
  },
};
