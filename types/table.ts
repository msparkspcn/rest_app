type Align = 'left' | 'center' | 'right';
export type ColumnDef<T> = {
    key: keyof T | string;
    title: string;
    flex: number;
    align?: Align;
    headerAlign?: Align;
    cellAlign?: Align;
};
