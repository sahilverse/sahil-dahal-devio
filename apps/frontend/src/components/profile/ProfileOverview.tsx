"use client";

import { UserProfile } from "@/types/profile";
import ProfileHeatmap from "./ProfileHeatmap";
import ProfileActivityStats from "./ProfileActivityStats";
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
            <ProfileHeatmap data={profile.activityMap} />
            <ProfileActivityStats
                problemStats={profile.problemStats}
                roomStats={profile.roomStats}
            />
        </motion.div>
    );
}
