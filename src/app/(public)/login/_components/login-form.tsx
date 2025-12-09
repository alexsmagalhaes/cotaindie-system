"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { useSignIn } from "../_hooks/use-login";
import { loginDefaultValues, loginSchema } from "../_schema/sign-in-schema";

export const SignInForm = () => {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaultValues,
  });

  const { execute, isPending } = useSignIn();
  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    execute(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: sistema@cotaindie.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <InputPassword {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {!isPending && (
            <>
              Entrar no sistema <Icon name="login" />
            </>
          )}
          {isPending && (
            <>
              <Icon name="progress_activity" className="animate-spin" />{" "}
              Entrando...
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};
