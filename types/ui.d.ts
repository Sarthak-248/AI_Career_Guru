declare module "@/components/ui/button" {
  import * as React from "react";

  export type ButtonVariant =
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";

  export type ButtonSize = "default" | "sm" | "lg" | "icon";

  export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    asChild?: boolean;
    className?: string;
  };

  export const Button: React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLButtonElement>
  >;
  export const buttonVariants: (opts?: any) => string;
}

declare module "@/components/ui/card" {
  import * as React from "react";

  type DivProps = React.HTMLAttributes<HTMLDivElement> & { className?: string };

  export const Card: React.ForwardRefExoticComponent<
    DivProps & React.RefAttributes<HTMLDivElement>
  >;
  export const CardHeader: React.ForwardRefExoticComponent<
    DivProps & React.RefAttributes<HTMLDivElement>
  >;
  export const CardFooter: React.ForwardRefExoticComponent<
    DivProps & React.RefAttributes<HTMLDivElement>
  >;
  export const CardTitle: React.ForwardRefExoticComponent<
    DivProps & React.RefAttributes<HTMLDivElement>
  >;
  export const CardDescription: React.ForwardRefExoticComponent<
    DivProps & React.RefAttributes<HTMLDivElement>
  >;
  export const CardContent: React.ForwardRefExoticComponent<
    DivProps & React.RefAttributes<HTMLDivElement>
  >;
}

declare module "@/components/ui/badge" {
  import * as React from "react";

  export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: string;
    className?: string;
  };

  export const Badge: React.ForwardRefExoticComponent<
    BadgeProps & React.RefAttributes<HTMLDivElement>
  >;
}

declare module "@/components/ui/label" {
  import * as React from "react";

  export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
    className?: string;
  };

  export const Label: React.ForwardRefExoticComponent<
    LabelProps & React.RefAttributes<HTMLLabelElement>
  >;
}

declare module "@/components/ui/select" {
  import * as React from "react";

  export const Select: React.FC<{
    value?: string;
    onValueChange?: (v: string) => void;
    children?: React.ReactNode;
  }>;

  export const SelectGroup: React.FC<any>;
  export const SelectValue: React.FC<{ placeholder?: string }>;

  export const SelectTrigger: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>
  >;

  export const SelectContent: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>
  >;

  export const SelectLabel: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>
  >;

  export const SelectItem: React.ForwardRefExoticComponent<
    { value?: string; children?: React.ReactNode } & React.RefAttributes<HTMLElement>
  >;

  export const SelectSeparator: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>
  >;

  export const SelectScrollUpButton: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>
  >;

  export const SelectScrollDownButton: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>
  >;
}

declare module "@/components/ui/input" {
  import * as React from "react";

  export const Input: React.ForwardRefExoticComponent<
    React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>
  >;
}

declare module "@/components/ui/textarea" {
  import * as React from "react";

  export const Textarea: React.ForwardRefExoticComponent<
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & React.RefAttributes<HTMLTextAreaElement>
  >;
}
