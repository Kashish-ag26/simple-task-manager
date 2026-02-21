"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserInput } from "@/server/validations";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";
import toast from "react-hot-toast";

interface CreateUserFormProps {
  onSuccess: () => void;
}

export default function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "USER" },
  });

  const onSubmit = async (data: CreateUserInput) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("User created");
        reset();
        onSuccess();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="name"
        label="Full Name"
        placeholder="John Doe"
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        id="email"
        label="Email"
        type="email"
        placeholder="user@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        id="password"
        label="Password"
        type="password"
        placeholder="Min 6 characters"
        error={errors.password?.message}
        {...register("password")}
      />
      <Select
        id="role"
        label="Role"
        options={[
          { value: "USER", label: "User" },
          { value: "ADMIN", label: "Admin" },
        ]}
        error={errors.role?.message}
        {...register("role")}
      />
      <Button type="submit" isLoading={isLoading} className="w-full">
        Create User
      </Button>
    </form>
  );
}

