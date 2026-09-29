import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import './Pagination.css';

const Pagination = ({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange,
    className = '',
}) => {
    if (totalPages <= 1 && totalItems <= itemsPerPage) return null;

    const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className={`pagination-container ${className}`}>
            <div className="pagination-info">
                {totalItems > 0 ? (
                    <span>
                        Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of <strong>{totalItems}</strong> records
                    </span>
                ) : (
                    <span>No records</span>
                )}
            </div>

            <div className="pagination-controls">
                <button
                    type="button"
                    className="pagination-nav-btn"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    aria-label="Previous page"
                >
                    <ChevronLeftIcon size={16} />
                    <span>Prev</span>
                </button>

                <div className="pagination-pages">
                    {getPageNumbers().map((page, idx) => {
                        if (page === '...') {
                            return (
                                <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                                    …
                                </span>
                            );
                        }

                        const isActive = page === currentPage;
                        return (
                            <button
                                key={`page-${page}`}
                                type="button"
                                className={`pagination-page-btn ${isActive ? 'active' : ''}`}
                                onClick={() => onPageChange(page)}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className="pagination-nav-btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    aria-label="Next page"
                >
                    <span>Next</span>
                    <ChevronRightIcon size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
