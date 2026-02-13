import Navbar from "@/components/navbar/Navbar";
import DynamicLayout from "./DynamicLayout";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <DynamicLayout>
                {children}
            </DynamicLayout>
        </>
    );
}
