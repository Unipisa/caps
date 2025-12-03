'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  name?: string;
  email?: string;
  admin: boolean;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetUsers {
                users {
                  id
                  username
                  name
                  email
                  admin
                }
              }
            `,
          }),
        });
        const result = await response.json();
        if (result.errors) {
          setError(result.errors[0].message);
        } else {
          setUsers(result.data.users);
        }
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} - {user.name} ({user.admin ? 'Admin' : 'User'})
          </li>
        ))}
      </ul>
    </div>
  );
}