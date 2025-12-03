import UsersList from "../components/UsersList";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">CAPS - Compilazione Assistita Piani di Studio</h1>
      <UsersList />
    </div>
  );
}
