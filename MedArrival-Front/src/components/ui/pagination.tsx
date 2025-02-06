import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { ButtonUI } from "./button-ui";
import React from "react";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
  
  export function Pagination({ 
    currentPage, 
    totalPages, 
    onPageChange,
    hasNextPage,
    hasPrevPage
  }: PaginationProps) {
    // Calculate visible page numbers
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];
      let l;
  
      range.push(1);
  
      if (totalPages <= 1) return range;
  
      for (let i = currentPage - delta; i <= currentPage + delta; i++) {
        if (i < totalPages && i > 1) {
          range.push(i);
        }
      }
      range.push(totalPages);
  
      for (let i of range) {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i;
      }
  
      return rangeWithDots;
    };
  
    return (
      <nav className="flex items-center gap-2">
        <ButtonUI
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </ButtonUI>
  
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 text-gray-500">...</span>
            ) : (
              <ButtonUI
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(Number(page))}
                className={cn(
                  "min-w-[2.5rem]",
                  currentPage === page && "bg-primary-600 text-white hover:bg-primary-700"
                )}
              >
                {page}
              </ButtonUI>
            )}
          </React.Fragment>
        ))}
  
        <ButtonUI
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </ButtonUI>
      </nav>
    );
  }