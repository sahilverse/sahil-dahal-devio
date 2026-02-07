import CreatePage from "@/components/create/CreatePage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Post to Dev.io",
    description: "Create a new post on Dev.io",
};

export default function CreatePostPage() {
    return (

        <CreatePage />

    );
}
