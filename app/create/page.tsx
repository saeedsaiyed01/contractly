export default function CreatePage() {
  return (
    <div className="grid grid-cols-2 h-screen">
      <div className="border-r overflow-y-auto p-8">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-6">
          Contract Details
        </h2>
        {/* ContractForm goes here next */}
      </div>
      <div className="bg-gray-50 overflow-y-auto p-8">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-6">
          Live Preview
        </h2>
        {/* ContractPreview goes here next */}
      </div>
    </div>
  )
}
```

Go to `http://localhost:3000/create` — you should see a two-column layout.

---

## Then build these 3 files in order

**Right now your only job is:**
```
1. components/form/ContractForm.tsx
   → input fields, onChange updates state

2. components/contract/Preview.tsx  
   → reads state, renders contract layout

3. Wire them together in app/create/page.tsx
   → type in form → preview updates live