import type { Category } from "@/lib/types";

interface CategoryBadgeProps {
  category: Pick<Category, "name" | "icon" | "color">;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor: `${category.color}1a`,
        color: category.color,
      }}
    >
      <span aria-hidden>{category.icon}</span>
      {category.name}
    </span>
  );
}
