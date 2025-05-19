const commonResponses = {
  math: {
    "what is 1+1": {
      response: "2\n\nWhen we add one unit to another unit, we get two units total. This fundamental concept forms the basis of addition in mathematics.",
      complexity: "basic"
    },
    "what is 2+2": {
      response: "4\n\nAdding two units to another two units gives us four units total. Think of combining two pairs of items together.",
      complexity: "basic"
    },
    "what is multiplication": {
      response: "A faster way to add the same number multiple times.\n\n  1. Instead of 3 + 3 + 3 + 3\n  2. We write 4 × 3 = 12\n\n  - Makes calculations quicker\n  - Useful for repeated addition\n  - Helps solve real-world problems",
      complexity: "basic"
    },
    "what is division": {
      response: "A way to split a number into equal parts.\n\n  1. Start with a total amount\n  2. Split it into equal groups\n  3. Count items in each group\n\nExample: 8 ÷ 2 = 4 means splitting 8 items into 2 groups of 4 items each.",
      complexity: "basic"
    },
    "what is algebra": {
      response: "Algebra is a branch of mathematics that uses symbols and letters to represent numbers and quantities in formulas and equations.\n\nKey concepts:\n  - Variables (like x or y) represent unknown values\n  - Equations show relationships between variables\n  - Solving equations finds the value of unknowns\n\nExample: 2x + 3 = 7 → x = 2",
      complexity: "intermediate"
    },
    "what is the pythagorean theorem": {
      response: "In a right-angled triangle: a² + b² = c²\n\nWhere:\n  - a and b are the lengths of the two shorter sides (legs)\n  - c is the length of the hypotenuse (side opposite the right angle)\n\nThis fundamental relationship helps calculate distances and solve many geometry problems.",
      complexity: "intermediate"
    }
  },
  science: {
    "what is evaporation": {
      response: "Evaporation is the process where liquid turns into gas at the surface level. Here's what happens:\n\n  1. Water molecules gain energy from heat\n  2. They break free from the liquid surface\n  3. They become water vapor in the air\n\nYou see this daily when wet clothes dry or puddles disappear in the sun. It's a crucial part of Earth's water cycle!",
      complexity: "intermediate"
    },
    "what is precipitation": {
      response: "Precipitation is how water returns to Earth from clouds. This happens in several forms:\n\n  - Rain: Liquid water droplets\n  - Snow: Frozen water crystals\n  - Sleet: Mix of rain and snow\n  - Hail: Balls of ice\n\nIt's nature's way of completing the water cycle, delivering water from the atmosphere back to the ground.",
      complexity: "intermediate"
    },
    "what is science": {
      response: "A systematic way of understanding the world through observation and experimentation.\n\n  1. Making observations of natural phenomena\n  2. Asking questions about what we observe\n  3. Testing ideas through experiments\n  4. Drawing conclusions from results\n\n  - Physics explores matter and energy\n  - Chemistry studies substances and reactions\n  - Biology investigates living things\n\n  - Helps solve real-world problems\n  - Creates new technologies\n  - Improves our daily lives",
      complexity: "basic"
    },
    "what is energy": {
      response: "The ability to do work or cause change in a system.\n\n  1. Kinetic energy comes from motion\n  2. Potential energy is stored for later use\n  3. Thermal energy appears as heat\n  4. Electrical energy powers our devices\n\nEnergy cannot be created or destroyed, only transformed between different forms.",
      complexity: "intermediate"
    },
    "what is photosynthesis": {
      response: "The process plants use to convert sunlight into chemical energy.\n\nKey steps:\n  1. Plants absorb sunlight using chlorophyll\n  2. Carbon dioxide enters through leaves\n  3. Water is absorbed through roots\n  4. Glucose (sugar) and oxygen are produced\n\nChemical equation: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂",
      complexity: "intermediate"
    },
    "what is newton's first law": {
      response: "Newton's First Law (Law of Inertia):\n\nAn object at rest stays at rest, and an object in motion stays in motion at constant speed and in a straight line unless acted upon by an unbalanced force.\n\nExamples:\n  - A book stays on a table until you push it\n  - A rolling ball slows down due to friction",
      complexity: "intermediate"
    }
  },
  history: {
    "what is history": {
      response: "The study of human civilization's past events and development.\n\n  1. Examines how societies evolved over time\n  2. Analyzes cultural and technological changes\n  3. Studies important historical figures and events\n  4. Uses evidence from documents and artifacts\n\n  - Helps understand present situations\n  - Provides lessons from past experiences\n  - Guides future decision-making",
      complexity: "basic"
    },
    "who is jose rizal": {
      response: "A Filipino national hero who lived from 1861 to 1896.\n\n  1. Wrote influential novels exposing colonial injustice\n  2. Advocated for peaceful reform in the Philippines\n  3. Practiced medicine and helped communities\n  4. Inspired the Philippine independence movement\n\n  - Known for novels: Noli Me Tangere and El Filibusterismo\n  - Executed by Spanish authorities in 1896\n  - Legacy continues to influence Filipino society",
      complexity: "intermediate"
    },
    "what caused world war 1": {
      response: "Main causes of World War I (1914-1918):\n\n1. Militarism - Arms race between nations\n2. Alliances - Complex web of defense agreements\n3. Imperialism - Competition for colonies\n4. Nationalism - Strong patriotic feelings\n\nImmediate trigger: Assassination of Archduke Franz Ferdinand of Austria-Hungary",
      complexity: "intermediate"
    },
    "who was abraham lincoln": {
      response: "16th U.S. President (1861-1865) who led the nation during the Civil War.\n\nKey achievements:\n  - Preserved the Union during the Civil War\n  - Issued the Emancipation Proclamation\n  - Delivered the Gettysburg Address\n  - Promoted the 13th Amendment abolishing slavery\n\nAssassinated in 1865 by John Wilkes Booth.",
      complexity: "intermediate"
    }
  },
  programming: {
    "what is a variable": {
      response: "A named container that stores data in a program.\n\nCharacteristics:\n  - Has a name (identifier)\n  - Holds a value\n  - Can change during program execution\n\nExample in JavaScript:\n  let age = 25;\n  let name = 'Alice';",
      complexity: "basic"
    },
    "what is a function": {
      response: "A reusable block of code that performs a specific task.\n\nKey parts:\n  1. Function name\n  2. Parameters (inputs)\n  3. Body (code to execute)\n  4. Return value (output)\n\nExample in JavaScript:\n  function add(a, b) {\n    return a + b;\n  }",
      complexity: "basic"
    },
    "what is object oriented programming": {
      response: "A programming paradigm based on objects containing data and methods.\n\nCore principles:\n  1. Encapsulation - Bundling data with methods\n  2. Inheritance - Creating new classes from existing ones\n  3. Polymorphism - Objects can take many forms\n\nExample languages: Java, C++, Python, JavaScript",
      complexity: "intermediate"
    }
  },
  general: {
    "hi": {
      response: "Welcome! Let's explore math, science, history, programming, or any other subject you're interested in learning about.",
      complexity: "basic"
    },
    "hello": {
      response: "Welcome! Let's explore math, science, history, programming, or any other subject you're interested in learning about.",
      complexity: "basic"
    },
    "how do i learn": {
      response: "Effective learning strategies for any subject:\n\n  1. Engage actively by asking questions\n  2. Practice regularly with exercises\n  3. Break topics into smaller parts\n  4. Connect new ideas to existing knowledge\n  5. Take breaks to process information\n\n  - Stay curious and interested\n  - Review material regularly\n  - Apply concepts practically",
      complexity: "intermediate"
    },
    "what subjects can you teach": {
      response: "I can help with various subjects including:\n\n  - Mathematics (algebra, geometry, calculus)\n  - Science (physics, chemistry, biology)\n  - History (world history, important figures)\n  - Programming (basics, OOP concepts)\n  - General learning strategies\n\nWhat would you like to learn about today?",
      complexity: "basic"
    }
  }
};

function checkCommonResponse(question, subject = null) {
  // Clean and normalize the question
  const normalizedQuestion = question.toLowerCase().trim();
  
  // Check subject-specific responses first if subject is provided
  if (subject && commonResponses[subject.toLowerCase()]) {
    const subjectResponse = commonResponses[subject.toLowerCase()][normalizedQuestion];
    if (subjectResponse) {
      return {
        found: true,
        ...subjectResponse
      };
    }
  }
  
  // Check all categories if not found in specific subject
  for (const category of Object.keys(commonResponses)) {
    const response = commonResponses[category][normalizedQuestion];
    if (response) {
      return {
        found: true,
        ...response
      };
    }
  }
  
  // No match found
  return {
    found: false,
    response: null,
    complexity: null
  };
}

module.exports = {
  checkCommonResponse
};
