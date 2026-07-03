import { db } from "../src/lib/db";

async function main() {
  const existing = await db.blog.count();
  if (existing > 0) {
    console.log(`Seed skipped: ${existing} blogs already exist.`);
    return;
  }

  await db.blog.createMany({
    data: [
      {
        title: "The Rise of Multimodal AI: Beyond Text",
        content:
          "Multimodal models are reshaping how machines understand the world. By combining text, images, and audio, these systems can reason across modalities in ways that feel almost human.\n\n## Why it matters\n\nTraditional language models excel at text, but the real world is multi-sensory. Multimodal AI opens the door to richer assistants, better accessibility tools, and more intuitive creative software.\n\n## What to watch\n\nExpect rapid progress in real-time video understanding, on-device multimodal models, and tighter integration with robotics. The next year will blur the line between reading, watching, and conversing with AI.",
        excerpt:
          "Multimodal models combine text, images, and audio to reason across modalities — here's why that changes everything.",
        tags: "AI, Multimodal, Deep Learning",
        category: "Artificial Intelligence",
        author: "AmberPress Editorial",
        source: "user",
        coverImage: "",
      },
      {
        title: "Edge Computing Meets GenAI: Smaller Models, Bigger Impact",
        content:
          "Generative AI is moving from the cloud to the edge. Quantized models running on phones and laptops are making intelligence more private, cheaper, and instantly available.\n\n## The shift\n\nA year ago, most generative workloads lived in massive data centers. Today, optimized 3B–8B parameter models run comfortably on consumer hardware, enabling offline assistants and on-device creativity tools.\n\n## Trade-offs\n\nEdge inference trades raw capability for latency, privacy, and cost. For many everyday tasks, that's a great deal.",
        excerpt:
          "Quantized models on phones and laptops are making generative AI private, cheap, and instant.",
        tags: "Edge AI, GenAI, Optimization",
        category: "Technology",
        author: "AmberPress Editorial",
        source: "user",
        coverImage: "",
      },
    ],
  });

  console.log("Seed complete: inserted sample blogs.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
