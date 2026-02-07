"use client";

import { useFormContext } from "react-hook-form";
import { PostType } from "@devio/zod-utils";
import TextPostEditor from "./TextPostEditor";
import LinkPostInputs from "./LinkPostInputs";
import QuestionPostInputs from "./QuestionPostInputs";

export default function PostTypeContent() {
    const { watch } = useFormContext();
    const type = watch("type") as PostType;

    return (
        <div className="transition-all duration-300">
            {type === PostType.TEXT && <TextPostEditor />}
            {type === PostType.QUESTION && <QuestionPostInputs />}
            {type === PostType.LINK && <LinkPostInputs />}
        </div>
    );
}
