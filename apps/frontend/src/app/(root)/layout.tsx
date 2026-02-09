import Navbar from "@/components/navbar/Navbar";
import HomeLayout from "@/components/layout/HomeLayout";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <HomeLayout>
                {children}
            </HomeLayout>
        </>
    );
}
