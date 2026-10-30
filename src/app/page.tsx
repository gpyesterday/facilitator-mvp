import { getData } from "@/lib/store";
import HomePageContent from "@/components/HomePageContent";

export default async function HomePage() {
  const data = await getData();

  return (
    <HomePageContent
      facilitators={data.users.filter((user) => user.role === "facilitator")}
      admins={data.users.filter((user) => user.role === "admin")}
    />
  );
}
