/* ------------------------------------------------------------------
 *  frontend/src/pages/AdminList.tsx
 * ------------------------------------------------------------------
 *  • Таблица новостей для админ-панели.                                  *
 *  • Пагинация + фильтры (status, category).                             *
 *  • Drag-and-drop reorder (обновляет поле `order` на сервере).          *
 *  • Действия: редактировать, архивировать.                              *
 * ------------------------------------------------------------------ */

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { NewsStatus } from '../../types/news-types'; // enum, если вынесен

/* ------------------------------------------------------------------ */
/*  Типы                                                              */
/* ------------------------------------------------------------------ */

interface NewsItem {
  id: number;
  title: string;
  category: string;
  status: NewsStatus;
  updatedAt: string;
  order: number;
}

/* ------------------------------------------------------------------ */
/*  Sortable row helper                                               */
/* ------------------------------------------------------------------ */
function DraggableRow({ row, children }: { row: any; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.original.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging && { background: '#f3f4f6' }),
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */
export default function AdminList() {
  const [data, setData] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [statusFilter, setStatusFilter] = useState<'published' | 'draft' | 'scheduled' | 'archived' | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  /* -------------------- fetch -------------------- */
  useEffect(() => {
    (async () => {
      const { data: res } = await api.get('/news', {
        params: {
          page,
          pageSize,
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
        },
      });
      setData(res.data);
      setTotal(res.meta.total);
    })();
  }, [page, pageSize, statusFilter, categoryFilter]);

  /* -------------------- columns ------------------ */
  const columns = useMemo<ColumnDef<NewsItem>[]>(
    () => [
      { accessorKey: 'order', header: '#', cell: (info) => info.getValue<number>() },
      { accessorKey: 'id', header: 'ID' },
      {
        accessorKey: 'title',
        header: 'Заголовок',
        cell: (info) => (
          <Link className="text-blue-600 hover:underline" to={`/admin/edit/${info.row.original.id}`}>
            {info.getValue<string>()}
          </Link>
        ),
      },
      { accessorKey: 'category', header: 'Категория' },
      {
        accessorKey: 'status',
        header: 'Статус',
        cell: (info) => (
          <span
            className={classNames('rounded px-2 py-0.5 text-xs text-white', {
              'bg-green-600': info.getValue() === 'published',
              'bg-yellow-500': info.getValue() === 'scheduled',
              'bg-gray-500': info.getValue() === 'draft',
              'bg-red-700': info.getValue() === 'archived',
            })}
          >
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Изменено',
        cell: (info) => dayjs(info.getValue<string>()).format('DD.MM.YY HH:mm'),
      },
      {
        id: 'actions',
        header: '⋯',
        cell: ({ row }) => (
          <div className="flex gap-2 text-sm">
            <Link to={`/admin/edit/${row.original.id}`} className="text-blue-600">
              ✎
            </Link>
            <button
              title="Архивировать"
              onClick={() => archive(row.original.id)}
              className="text-red-700 hover:text-red-800"
            >
              🗄
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    state: { pagination: { pageIndex: page - 1, pageSize } },
    onPaginationChange: () => {},
  });

  /* -------------------- actions ------------------ */
  const archive = async (id: number) => {
    await api.patch(`/news/${id}/archive`);
    toast.success('Перемещено в архив');
    setData((prev) => prev.filter((n) => n.id !== id));
  };

  /* -------------------- drag-and-drop ------------- */
  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = data.findIndex((n) => n.id === active.id);
    const newIndex = data.findIndex((n) => n.id === over.id);
    const newOrder = arrayMove(data, oldIndex, newIndex);
    setData(newOrder);

    try {
      await api.patch('/news/reorder', {
        ids: newOrder.map((n) => n.id).join(','),
      });
      toast.success('Сортировка сохранена');
    } catch {
      toast.error('Не удалось сохранить сортировку');
    }
  };

  /* -------------------- filters ------------------- */
  const statusOptions = ['', 'draft', 'scheduled', 'published', 'archived'];
  const categoryOptions = ['', 'economy', 'society', 'science', 'military'];

  return (
    <div className="space-y-6">
      {/* фильтры */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="border p-1">
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s || 'Все статусы'}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border p-1"
        >
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c || 'Все категории'}
            </option>
          ))}
        </select>

        <Link to="/admin/new" className="btn ml-auto">
          + Новая статья
        </Link>
      </div>

      {/* таблица */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <table className="table-base">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>

          <SortableContext items={data.map((d) => d.id)} strategy={verticalListSortingStrategy}>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <DraggableRow key={row.id} row={row}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </DraggableRow>
              ))}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>

      {/* пагинация */}
      <div className="flex items-center justify-between pt-4">
        <span>
          Страница {page} из {Math.max(1, Math.ceil(total / pageSize))}
        </span>
        <div className="space-x-2">
          <button
            className="btn-secondary px-2 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ←
          </button>
          <button
            className="btn-secondary px-2 disabled:opacity-40"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * pageSize >= total}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
