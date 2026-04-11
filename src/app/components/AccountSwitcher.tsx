// components/AccountSwitcher.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { BiUser, BiPlus, BiCheck, BiTrash } from "react-icons/bi";
import { SavedAccount, getSavedAccounts, removeSavedAccount } from "../store/saveAccountsStore";

interface Props {
  activeId: string | undefined;
  onSignOut: () => void;
  onOpenSettings: () => void;
}

const PROVIDER_LABELS: Record<string, string> = {
  github: "GitHub",
  google: "Google",
};

export function AccountSwitcher({ activeId, onSignOut, onOpenSettings }: Props) {
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  const [showAddProvider, setShowAddProvider] = useState(false);

  useEffect(() => {
    setAccounts(getSavedAccounts());
  }, [activeId]);

  function handleRemove(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = removeSavedAccount(id);
    setAccounts(updated);
    if (id === activeId) onSignOut();
  }

  function handleSwitch(account: SavedAccount) {
    if (account.id === activeId) return;

    const hint = account.email ?? undefined;
    const provider = account.provider ?? "google";

    if (provider === "google") {
      signIn("google", { callbackUrl: "/" }, { login_hint: hint });
    } else {

      signOut({ redirect: false }).then(() =>
        signIn(provider, { callbackUrl: "/" })
      );
    }
  }

  function handleAddAccount(providerId: string) {
    setShowAddProvider(false);

    if (providerId === "google") {
      signIn("google", { callbackUrl: "/" }, { prompt: "select_account" });
    } else {
      signIn(providerId, { callbackUrl: "/" });
    }
  }

  const activeAccount = accounts.find((a) => a.id === activeId);
  const otherAccounts = accounts.filter((a) => a.id !== activeId);

  return (
    <div className="absolute right-0 top-full mt-1 bg-[#252526] border border-[#454545] rounded-sm shadow-2xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-52">

      {/* ── Active account ── */}
      <div className="px-3 pt-2 pb-1">
        <div className="text-[10px] text-[#858585] uppercase tracking-wider mb-1.5">
          Active account
        </div>
        {activeAccount ? (
          <div className="flex items-center gap-2.5 py-1">
            <AccountAvatar account={activeAccount} size={22} />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] text-[#cccccc] truncate">{activeAccount.name ?? activeAccount.email}</div>
              <div className="text-[10px] text-[#858585] truncate">{activeAccount.email}</div>
            </div>
            <BiCheck className="w-3.5 h-3.5 text-[#007acc] shrink-0" />
          </div>
        ) : (
          <div className="text-[11px] text-[#858585]">No account</div>
        )}
      </div>

      {/* ── Other saved accounts ── */}
      {otherAccounts.length > 0 && (
        <>
          <div className="mx-3 my-1 h-px bg-[#3e3e42]" />
          <div className="px-3 pb-1">
            <div className="text-[10px] text-[#858585] uppercase tracking-wider mb-1">
              Switch to
            </div>
            {otherAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => handleSwitch(account)}
                className="flex items-center gap-2.5 w-full py-1.5 hover:bg-[#2a2d2e] rounded-sm px-1 -mx-1 group/acct transition-colors"
              >
                <AccountAvatar account={account} size={20} />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[12px] text-[#cccccc] truncate">{account.name ?? account.email}</div>
                  <div className="text-[10px] text-[#858585] truncate">
                    {account.provider ? PROVIDER_LABELS[account.provider] : ""} · {account.email}
                  </div>
                </div>
                <button
                  onClick={(e) => handleRemove(account.id, e)}
                  className="opacity-0 group-hover/acct:opacity-100 p-0.5 hover:text-[#f48771] text-[#858585] transition-all"
                  title="Remove account"
                >
                  <BiTrash className="w-3 h-3" />
                </button>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Add another account ── */}
      <div className="mx-3 my-1 h-px bg-[#3e3e42]" />

      {!showAddProvider ? (
        <button
          onClick={() => setShowAddProvider(true)}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e] transition-colors"
        >
          <BiPlus className="w-3.5 h-3.5" />
          Add another account
        </button>
      ) : (
        <div className="px-3 py-1">
          <div className="text-[10px] text-[#858585] uppercase tracking-wider mb-1.5">
            Sign in with
          </div>
          {[
            { id: "github", label: "GitHub" },
            { id: "google", label: "Google" },
            //{ id: "discord", label: "Discord" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => handleAddAccount(p.id)}
              className="flex items-center gap-2 w-full py-1.5 text-[12px] text-[#cccccc] hover:bg-[#2a2d2e] rounded-sm px-1 -mx-1 transition-colors"
            >
              <span className="w-4 h-4 rounded-full bg-[#3e3e42] flex items-center justify-center text-[8px]">
                {p.label[0]}
              </span>
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setShowAddProvider(false)}
            className="text-[10px] text-[#858585] hover:text-[#cccccc] mt-1"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Settings / Sign out ── */}
      <div className="mx-3 my-1 h-px bg-[#3e3e42]" />
      <button
        onClick={onOpenSettings}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-[#cccccc] hover:bg-[#2a2d2e] transition-colors"
      >
        Settings
      </button>
      <button
        onClick={onSignOut}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-left text-[#f48771] hover:bg-[#f48771]/20 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}

function AccountAvatar({ account, size }: { account: SavedAccount; size: number }) {
  if (account.image) {
    return (
      <div
        className="rounded-full overflow-hidden shrink-0 ring-1 ring-[#3e3e42]"
        style={{ width: size, height: size }}
      >
        <Image src={account.image} alt="" width={size} height={size} className="object-cover" />
      </div>
    );
  }
  return (
    <div
      className="rounded-full bg-[#505050] flex items-center justify-center shrink-0 text-[#cccccc]"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {account.email?.[0]?.toUpperCase() ?? <BiUser />}
    </div>
  );
}