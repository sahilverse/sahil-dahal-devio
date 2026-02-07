"use client";

import TextPostEditor from "./TextPostEditor";
import BountySelector from "./BountySelector";

export default function QuestionPostInputs() {
    return (
        <div
            className="space-y-8"
        >
            <BountySelector />
            <TextPostEditor />
        </div>
    );
}
