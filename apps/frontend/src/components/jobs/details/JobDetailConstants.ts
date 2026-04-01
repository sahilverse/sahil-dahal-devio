import React from "react";
import { Clock, Eye, Star, CheckCircle2, XCircle } from "lucide-react";

export const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    PENDING: { 
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20", 
        icon: React.createElement(Clock, { className: "size-3.5" }), 
        label: "Pending Review" 
    },
    REVIEWING: { 
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20", 
        icon: React.createElement(Eye, { className: "size-3.5" }), 
        label: "Under Review" 
    },
    SHORTLISTED: { 
        color: "text-violet-500 bg-violet-500/10 border-violet-500/20", 
        icon: React.createElement(Star, { className: "size-3.5" }), 
        label: "Shortlisted" 
    },
    ACCEPTED: { 
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", 
        icon: React.createElement(CheckCircle2, { className: "size-3.5" }), 
        label: "Accepted" 
    },
    REJECTED: { 
        color: "text-red-500 bg-red-500/10 border-red-500/20", 
        icon: React.createElement(XCircle, { className: "size-3.5" }), 
        label: "Not Selected" 
    },
};

export const workplaceLabels = {
    ON_SITE: "On-site",
    HYBRID: "Hybrid",
    REMOTE: "Remote",
};

export const typeLabels = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    FREELANCE: "Freelance",
    INTERNSHIP: "Internship",
};
