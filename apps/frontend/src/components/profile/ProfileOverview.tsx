"use client";

import { UserProfile } from "@/types/profile";
import { ActivityHeatmap, ActivityStats } from "./overview";
import { motion } from "motion/react";

interface ProfileOverviewProps {
    profile: UserProfile;
}

export default function ProfileOverview({ profile }: ProfileOverviewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
        >
            <ActivityHeatmap data={profile.activityMap} />
            <ActivityStats
                problemStats={profile.problemStats}
                roomStats={profile.roomStats}
            />
        </motion.div>
    );
}
