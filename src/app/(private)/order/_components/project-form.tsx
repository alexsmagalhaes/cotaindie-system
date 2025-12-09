"use client";

import { FormWrapper } from "@/app/_components/form-wrapper";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { useProjectForm } from "../_hooks/use-project-form";
import { Stepper } from "../_provider/project-stepper-provider";
import { useOrderStore } from "../_stores/order-store";
import {
  getProjectDefaultValues,
  projectSchema,
} from "../schema/project-form-schema";
import { ProjectActions } from "./project-form-actions";
import { ProjectStepOne } from "./project-step-one";
import { ProjectStepTwo } from "./project-step-two";

export const ProjectForm = ({
  project,
  index,
  isOpen,
}: {
  project?: Project;
  index?: number;
  isOpen: (value: boolean) => void;
}) => {
  const stepper = Stepper.useStepper();

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(stepper.current.schema),
    mode: "onBlur",
    defaultValues: getProjectDefaultValues(project),
  });

  useEffect(() => {
    return () => {
      stepper.reset();
    };
  }, []);

  const setTrigger = useOrderStore((state) => state.setTrigger);
  const { saveProject } = useProjectForm();
  const { updateProject } = useOrderStore();

  useEffect(() => {
    setTrigger("projectsForm", form.trigger);
  }, [form.trigger, setTrigger]);

  const onSubmit = (values: z.infer<typeof projectSchema>) => {
    if (form.formState.isLoading) return;

    const { rawAmount, ...projectData } = values;

    let success = false;

    if (typeof index === "number" && project) {
      updateProject(index, projectData);
      success = true;
    } else {
      success = saveProject(projectData);
    }

    if (success && isOpen) {
      isOpen(false);
    }
  };

  return (
    <Form {...form}>
      <FormWrapper onSubmit={form.handleSubmit(onSubmit)}>
        {stepper.switch({
          pieces: () => <ProjectStepOne />,
          costs: () => <ProjectStepTwo />,
        })}
        <ProjectActions index={index} />
      </FormWrapper>
    </Form>
  );
};
