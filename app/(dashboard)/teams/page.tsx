"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth-store";
import type { TeamItem } from "@/types";

function TeamCard({ team, onDelete, isAdmin }: { team: TeamItem; onDelete: (id: string) => void; isAdmin: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-xl font-bold text-white shadow">
          {team.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">{team.name}</h3>
          {team.description && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{team.description}</p>}
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {team._count?.members || team.members.length} members · {team._count?.tasks ?? 0} tasks
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setExpanded(!expanded)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
            {expanded ? "Close" : "View"}
          </button>
          {isAdmin && (
            <button onClick={() => onDelete(team.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:border-red-800/40 dark:hover:bg-red-900/20">
              Delete
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-700"
          >
            <div className="p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Members</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {team.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-700/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-xs font-bold text-white">
                      {m.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{m.user.name}</p>
                      <p className="text-xs text-slate-400">{m.user.email}</p>
                    </div>
                    <span className="ml-auto rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                      {m.user.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CreateTeamModal({ onClose, onCreated, userList }: { onClose: () => void; onCreated: (team: TeamItem) => void; userList: { id: string; name: string; email: string }[] }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = (id: string) => setSelectedMembers((prev) => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s; });

  const submit = async () => {
    if (!name.trim()) { setError("Team name is required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, memberIds: Array.from(selectedMembers) }),
      });
      const data = await res.json();
      if (data.success) { onCreated(data.data); onClose(); }
      else setError(data.error || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
      >
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Create Team</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Team Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Development Team" className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Add Members</label>
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-slate-200 p-2 dark:border-slate-600">
              {userList.map((u) => (
                <label key={u.id} className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${selectedMembers.has(u.id) ? "bg-primary-50 dark:bg-primary-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
                  <input type="checkbox" checked={selectedMembers.has(u.id)} onChange={() => toggle(u.id)} className="accent-primary-500" />
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-xs font-bold text-white">{u.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">Cancel</button>
            <button onClick={submit} disabled={loading} className="flex-1 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60">
              {loading ? "Creating..." : "Create Team"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function TeamsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [userList, setUserList] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/teams").then((r) => r.json()),
      isAdmin ? fetch("/api/users").then((r) => r.json()) : Promise.resolve({ success: false, data: [] }),
    ]).then(([teamsData, usersData]) => {
      if (teamsData.success) setTeams(teamsData.data);
      if (usersData.success) setUserList(usersData.data);
    }).finally(() => setLoading(false));
  }, [isAdmin]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team?")) return;
    await fetch(`/api/teams/${id}`, { method: "DELETE" });
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Teams 👥</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your teams and collaborate</p>
        </div>
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Team
          </motion.button>
        )}
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-700" />)}
        </div>
      ) : teams.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center dark:border-slate-700">
          <span className="text-5xl">👥</span>
          <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">No teams yet</p>
          <p className="mt-1 text-sm text-slate-400">{isAdmin ? "Create a team to start collaborating" : "You haven't been added to any teams yet"}</p>
          {isAdmin && (
            <button onClick={() => setShowCreate(true)} className="mt-4 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600">
              Create First Team
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} onDelete={handleDelete} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateTeamModal
            onClose={() => setShowCreate(false)}
            onCreated={(team) => setTeams((prev) => [team, ...prev])}
            userList={userList}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
