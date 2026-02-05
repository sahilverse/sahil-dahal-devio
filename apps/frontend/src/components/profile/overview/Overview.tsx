"use client";

import { UserProfile } from "@/types/profile";
import ActivityHeatmap from "./ActivityHeatmap";
import ActivityStats from "./ActivityStats";
import { motion } from "motion/react";

interface OverviewProps {
    profile: UserProfile;
}

export default function Overview({ profile }: OverviewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
        >
            <ActivityHeatmap username={profile.username} />
            <ActivityStats
                problemStats={profile.problemStats}
                roomStats={profile.roomStats}
            />
        </motion.div>
    );
}
