import { prisma } from "../src/config/prisma";

async function main() {
    console.log("🌱 Starting database seeding...");

    const userRole = await prisma.role.upsert({
        where: { id: 0 },
        update: {},
        create: {
            id: 0,
            name: "user",
            description: "Default user role with standard permissions",
        },
    });

    const adminRole = await prisma.role.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: "admin",
            description: "Administrator role with full permissions",
        },
    });

    console.log("✅ Roles seeded:");
    console.log(`   - ${userRole.name} (id: ${userRole.id})`);
    console.log(`   - ${adminRole.name} (id: ${adminRole.id})`);

    console.log("🌱 Database seeding completed!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
 