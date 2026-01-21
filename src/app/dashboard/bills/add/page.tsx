'use client';

import { Suspense } from 'react';
import { AddBillContent } from './add-bill-content';

export default function AddBillPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddBillContent />
    </Suspense>
  );
}
