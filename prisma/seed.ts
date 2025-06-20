// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const subjects = [
    'Quantitaive reasoning',
    'English Language/studies',
    'Mathematics',
    'Verbal reasoning',
    'Science and Technology',
    'Cultural and creative Arts',
    'Computer Science',
    'Phonics',
    'Vocational aptitude',
    'Physics',
    'Chemistry',
    'Further Mathematics',
    // Add more subjects as needed
  ];

  for (const name of subjects) {
    const subject = await prisma.subject.upsert({
      where: { name: name },
      update: {},
      create: { name: name },
    });
    console.log(`Created or found subject with id: ${subject.id} - ${subject.name})`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });