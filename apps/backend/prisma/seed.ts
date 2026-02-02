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

    // Achievement Categories & Criteria Constants
    const Category = {
        PROBLEMS: "PROBLEMS",
        CYBER_SECURITY: "CYBER_SECURITY",
        STREAKS: "STREAKS",
        AURA: "AURA",
        ENGAGEMENT: "ENGAGEMENT",
        CONTRIBUTION: "CONTRIBUTION",
    } as const;

    const Criteria = {
        PROBLEM_SOLVED: "PROBLEM_SOLVED",
        EASY_SOLVED: "EASY_SOLVED",
        MEDIUM_SOLVED: "MEDIUM_SOLVED",
        HARD_SOLVED: "HARD_SOLVED",
        ROOMS_COMPLETED: "ROOMS_COMPLETED",
        FLAGS_CAPTURED: "FLAGS_CAPTURED",
        STREAK_DAYS: "STREAK_DAYS",
        AURA_POINTS: "AURA_POINTS",
        POSTS_CREATED: "POSTS_CREATED",
        COMMENTS_CREATED: "COMMENTS_CREATED",
        USERS_FOLLOWED: "USERS_FOLLOWED",
        COMMUNITY_CREATED: "COMMUNITY_CREATED",
        ANSWERS_ACCEPTED: "ANSWERS_ACCEPTED",
        UPVOTES_RECEIVED: "UPVOTES_RECEIVED",
        EVENTS_HOSTED: "EVENTS_HOSTED",
        BOUNTIES_WON: "BOUNTIES_WON",
    } as const;

    // Helper to generate slug from name
    const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

    // Helper to create achievement
    const achievement = (
        name: string,
        description: string,
        category: string,
        criteria: string,
        threshold: number,
        auraReward: number,
        cipherReward: number,
        isHidden = false
    ) => ({ name, slug: toSlug(name), description, category, criteria, threshold, auraReward, cipherReward, isHidden });

    const achievements = [
        // PROBLEMS
        achievement("First Blood", "Solve your first problem", Category.PROBLEMS, Criteria.PROBLEM_SOLVED, 1, 10, 0),
        achievement("Getting Started", "Solve 10 problems", Category.PROBLEMS, Criteria.PROBLEM_SOLVED, 10, 25, 0),
        achievement("Problem Hunter", "Solve 25 problems", Category.PROBLEMS, Criteria.PROBLEM_SOLVED, 25, 50, 15),
        achievement("Century Solver", "Solve 100 problems", Category.PROBLEMS, Criteria.PROBLEM_SOLVED, 100, 200, 50),
        achievement("Algorithm Master", "Solve 500 problems", Category.PROBLEMS, Criteria.PROBLEM_SOLVED, 500, 1000, 200),
        achievement("Easy Peasy", "Solve 50 easy problems", Category.PROBLEMS, Criteria.EASY_SOLVED, 50, 50, 10),
        achievement("Medium Rare", "Solve 50 medium problems", Category.PROBLEMS, Criteria.MEDIUM_SOLVED, 50, 100, 25),
        achievement("Hardcode", "Solve 25 hard problems", Category.PROBLEMS, Criteria.HARD_SOLVED, 25, 200, 75),

        // CYBER_SECURITY
        achievement("Lab Initiate", "Complete your first CyberRoom", Category.CYBER_SECURITY, Criteria.ROOMS_COMPLETED, 1, 20, 5),
        achievement("Lab Rat", "Complete 5 CyberRooms", Category.CYBER_SECURITY, Criteria.ROOMS_COMPLETED, 5, 75, 25),
        achievement("Security Enthusiast", "Complete 15 CyberRooms", Category.CYBER_SECURITY, Criteria.ROOMS_COMPLETED, 15, 200, 75),
        achievement("Cyber Warrior", "Complete 30 CyberRooms", Category.CYBER_SECURITY, Criteria.ROOMS_COMPLETED, 30, 500, 150),
        achievement("Flag Hunter", "Submit 50 correct flags", Category.CYBER_SECURITY, Criteria.FLAGS_CAPTURED, 50, 100, 30),
        achievement("CTF Champion", "Submit 200 correct flags", Category.CYBER_SECURITY, Criteria.FLAGS_CAPTURED, 200, 400, 100),

        // STREAKS
        achievement("First Step", "Start a 3-day streak", Category.STREAKS, Criteria.STREAK_DAYS, 3, 10, 0),
        achievement("Week Warrior", "Maintain a 7-day streak", Category.STREAKS, Criteria.STREAK_DAYS, 7, 30, 10),
        achievement("Two Week Terror", "Maintain a 14-day streak", Category.STREAKS, Criteria.STREAK_DAYS, 14, 75, 25),
        achievement("Month Master", "Maintain a 30-day streak", Category.STREAKS, Criteria.STREAK_DAYS, 30, 200, 75),
        achievement("Streak Legend", "Maintain a 100-day streak", Category.STREAKS, Criteria.STREAK_DAYS, 100, 1000, 300, true),
        achievement("Year of Code", "Maintain a 365-day streak", Category.STREAKS, Criteria.STREAK_DAYS, 365, 5000, 1000, true),

        // AURA
        achievement("Rising Star", "Earn 500 Aura points", Category.AURA, Criteria.AURA_POINTS, 500, 0, 10),
        achievement("Community Member", "Earn 1,000 Aura points", Category.AURA, Criteria.AURA_POINTS, 1000, 0, 25),
        achievement("Trusted Contributor", "Earn 5,000 Aura points", Category.AURA, Criteria.AURA_POINTS, 5000, 0, 75),
        achievement("Aura Elite", "Earn 10,000 Aura points", Category.AURA, Criteria.AURA_POINTS, 10000, 0, 150),
        achievement("Aura Legend", "Earn 50,000 Aura points", Category.AURA, Criteria.AURA_POINTS, 50000, 0, 500, true),

        // ENGAGEMENT
        achievement("First Post", "Create your first post", Category.ENGAGEMENT, Criteria.POSTS_CREATED, 1, 5, 0),
        achievement("Active Poster", "Create 10 posts", Category.ENGAGEMENT, Criteria.POSTS_CREATED, 10, 25, 5),
        achievement("Content Creator", "Create 50 posts", Category.ENGAGEMENT, Criteria.POSTS_CREATED, 50, 100, 30),
        achievement("Commentator", "Leave 25 comments", Category.ENGAGEMENT, Criteria.COMMENTS_CREATED, 25, 25, 5),
        achievement("Discussion Leader", "Leave 100 comments", Category.ENGAGEMENT, Criteria.COMMENTS_CREATED, 100, 75, 20),
        achievement("Socialite", "Follow 20 users", Category.ENGAGEMENT, Criteria.USERS_FOLLOWED, 20, 15, 0),
        achievement("Community Builder", "Create a community", Category.ENGAGEMENT, Criteria.COMMUNITY_CREATED, 1, 50, 0),

        // CONTRIBUTION
        achievement("Helpful Hand", "Have an answer accepted", Category.CONTRIBUTION, Criteria.ANSWERS_ACCEPTED, 1, 15, 5),
        achievement("Problem Solver", "Have 10 answers accepted", Category.CONTRIBUTION, Criteria.ANSWERS_ACCEPTED, 10, 75, 25),
        achievement("Expert Advisor", "Have 50 answers accepted", Category.CONTRIBUTION, Criteria.ANSWERS_ACCEPTED, 50, 300, 100),
        achievement("Upvote Magnet", "Receive 100 upvotes", Category.CONTRIBUTION, Criteria.UPVOTES_RECEIVED, 100, 50, 15),
        achievement("Community Star", "Receive 500 upvotes", Category.CONTRIBUTION, Criteria.UPVOTES_RECEIVED, 500, 200, 75),
        achievement("Event Organizer", "Host an approved event", Category.CONTRIBUTION, Criteria.EVENTS_HOSTED, 1, 100, 50),
        achievement("Bounty Hunter", "Win 5 question bounties", Category.CONTRIBUTION, Criteria.BOUNTIES_WON, 5, 100, 50),
    ];

    for (const a of achievements) {
        await prisma.achievement.upsert({
            where: { slug: a.slug },
            update: {},
            create: {
                name: a.name,
                slug: a.slug,
                description: a.description,
                category: a.category as any,
                criteria: a.criteria,
                threshold: a.threshold,
                auraReward: a.auraReward,
                cipherReward: a.cipherReward,
                isHidden: a.isHidden,
            },
        });
    }

    console.log(`✅ Achievements seeded: ${achievements.length} achievements`);

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
