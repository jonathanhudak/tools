import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';
export const Route = createRootRoute({
    component: () => (_jsxs(_Fragment, { children: [_jsx(Outlet, {}), _jsx(Toaster, { richColors: true, position: "top-center" })] })),
});
//# sourceMappingURL=__root.js.map