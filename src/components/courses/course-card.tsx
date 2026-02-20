import Link from "next/link";
import { BookOpen, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { Course } from "@/features/courses/courses.service";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const price = course.pricing?.amount ?? course.price ?? 0;

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-md flex flex-col group">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {course.course_image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={course.course_image}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-secondary">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          {price === 0 && (
            <Badge className="absolute right-2 top-2 bg-green-600 hover:bg-green-700">
              Free
            </Badge>
          )}
        </div>
        <CardHeader className="p-4 flex-1">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge variant="outline" className="text-xs font-normal">
              {course.curriculum?.length || course._count?.modules || 0} Modules
            </Badge>
            {course.instructor?.rating > 0 && (
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-xs font-medium">
                  {course.instructor.rating}
                </span>
              </div>
            )}
          </div>
          <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {course.description?.replace(/<[^>]*>?/gm, "") ||
              "No description available."}
          </p>
        </CardHeader>
        <CardFooter className="p-4 pt-0 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              By {course.instructor?.name || "Instructor"}
            </span>
          </div>
          <p className="font-bold text-lg">
            {price === 0 ? "Free" : formatPrice(price)}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
