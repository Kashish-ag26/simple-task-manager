"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import UserTable from "@/components/admin/user-table";
import CreateUserForm from "@/components/admin/create-user-form";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";

export default function UserManagementPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create, edit, and manage user accounts and roles
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New User
        </Button>
      </motion.div>

      <UserTable key={refreshKey} />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New User">
        <CreateUserForm
          onSuccess={() => {
            setShowCreate(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      </Modal>
    </div>
  );
}
