import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useComplaints } from "../hooks/useComplaints";
import { useLanguage } from "../context/LanguageContext";
import {
  MessageSquare,
  X,
  Send,
  Search,
  Loader2,
  Paperclip,
  FileText,
  ArrowLeft,
  Edit2,
} from "lucide-react";

const Complaints = () => {
  const {
    complaints,
    loading,
    error,
    replyComplaint,
    changeStatus,
    deleteComplaint,
  } = useComplaints();

  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [searchParams] = useSearchParams();
  const targetOrderId = searchParams.get("orderId");
  const targetTicketId = searchParams.get("ticketId");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [reply, setReply] = useState("");
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingMsgText, setEditingMsgText] = useState("");

  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const editInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedComplaint) {
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedComplaint, selectedComplaint?.messages?.length]);

  useEffect(() => {
    if (editingMsgId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingMsgId]);

  const t = {
    title: isAr ? "المحادثات" : "Chats",
    subtitle: isAr
      ? "محادثات العملاء ورسائل الدعم"
      : "Customer conversations and support messages",
    total: isAr ? "الكل" : "All",
    pending: isAr ? "قيد الانتظار" : "Pending",
    replied: isAr ? "تم الرد" : "Replied",
    closed: isAr ? "مغلقة" : "Closed",
    searchPlaceholder: isAr
      ? "ابحث..."
      : "Search...",
    allStatuses: isAr ? "الكل" : "All",
    noTickets: isAr
      ? "لا توجد محادثات."
      : "No conversations found.",
    noMessagesYet: isAr
      ? "ابدأ المحادثة..."
      : "Start the conversation...",
    replyPlaceholder: isAr
      ? "اكتب رسالة..."
      : "Type a message...",
    cancel: isAr ? "إلغاء" : "Cancel",
    closeTicket: isAr ? "إغلاق التذكرة" : "Close Ticket",
    closeTicketText: isAr
      ? "هل تريد إغلاق هذه التذكرة؟ سيتم الاحتفاظ بسجل المحادثة."
      : "Close this ticket? Chat history will be preserved.",
    emptyReplyErr: isAr
      ? "اكتب رسالة أو أرفق ملف."
      : "Enter a message or attach a file.",
    replySuccess: isAr ? "تم الإرسال." : "Sent.",
    closeSuccess: isAr ? "تم الإغلاق." : "Ticket closed.",
    statusSuccess: isAr
      ? "تم تحديث الحالة."
      : "Status updated.",
    onlineText: isAr ? "متصل" : "Online",
    teamName: isAr ? "فريق الدعم" : "Dealora Support",
    clientName: isAr ? "العميل" : "Client",
    edit: isAr ? "تعديل" : "Edit",
    save: isAr ? "حفظ" : "Save",
    back: isAr ? "رجوع" : "Back",
    noSearchResults: isAr ? "لا توجد نتائج" : "No results found",
  };

  // Auto-select from URL params
  useEffect(() => {
    if ((targetTicketId || targetOrderId) && complaints.length > 0) {
      const match = complaints.find(
        (item) =>
          String(item.ticketId) === String(targetTicketId) ||
          String(item.orderId) === String(targetOrderId) ||
          String(item.id) === String(targetOrderId)
      );
      if (match) {
        setSelectedComplaint(match);
      }
    }
  }, [targetTicketId, targetOrderId, complaints]);

  // Sync selected complaint with latest data
  useEffect(() => {
    if (selectedComplaint && complaints.length > 0) {
      const updated = complaints.find((c) => c.id === selectedComplaint.id);
      if (updated) {
        setSelectedComplaint(updated);
      }
    }
  }, [complaints]);

  const totalComplaints = complaints.length;
  const openComplaints = complaints.filter(
    (item) => item.status === "OPEN" || item.status === "PENDING"
  ).length;
  const repliedComplaints = complaints.filter(
    (item) => item.status === "REPLIED"
  ).length;
  const closedComplaints = complaints.filter(
    (item) => item.status === "CLOSED"
  ).length;

  const filteredComplaints = useMemo(() => {
    let data = [...complaints];

    if (statusFilter !== "all") {
      data = data.filter((item) => item.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((item) => {
        const firstMsgText = item.messages?.[0]?.text || "";
        const nameStr = item.customerName || item.clientName || "";
        const emailStr = item.email || item.clientEmail || "";
        return (
          nameStr.toLowerCase().includes(q) ||
          emailStr.toLowerCase().includes(q) ||
          firstMsgText.toLowerCase().includes(q)
        );
      });
    }

    return data;
  }, [complaints, search, statusFilter]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        type: file.type,
        url: event.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleReply = async (e) => {
    if (e) e.preventDefault();
    if (!reply.trim() && !attachedFile) {
      toast.error(t.emptyReplyErr);
      return;
    }

    const newMsgObj = {
      id: `MSG-${Date.now()}`,
      sender: "admin",
      text: reply.trim(),
      file: attachedFile?.url || null,
      fileType: attachedFile?.type || null,
      fileName: attachedFile?.name || null,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: new Date().toISOString(),
    };

    try {
      await replyComplaint(
        selectedComplaint.id,
        reply || attachedFile?.name,
        attachedFile?.url
      );
      toast.success(t.replySuccess);

      setSelectedComplaint((prev) => ({
        ...prev,
        status: "REPLIED",
        messages: [...(prev?.messages || []), newMsgObj],
      }));

      setReply("");
      setAttachedFile(null);
    } catch (err) {
      toast.error(err.message || "Failed to send reply");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComplaint(deleteId);
      toast.success(t.closeSuccess);
      if (selectedComplaint?.id === deleteId) {
        setSelectedComplaint(null);
      }
      setDeleteId(null);
    } catch (err) {
      toast.error(err.message || "Failed to close");
    }
  };

  const handleEditMessage = async (msgId) => {
    if (!editingMsgText.trim()) return;
    const rawId = String(msgId).replace(/^CHAT-/, "");
    try {
      const apiClient = (await import("../services/apiClient")).apiClient;
      await apiClient.put(`/complaints/messages/${rawId}`, {
        text: editingMsgText.trim(),
        senderType: "admin",
      });
      setSelectedComplaint((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          String(m.id) === String(msgId)
            ? { ...m, text: editingMsgText.trim() }
            : m
        ),
      }));
      setEditingMsgId(null);
      setEditingMsgText("");
      toast.success(isAr ? "تم التعديل" : "Message updated");
    } catch (err) {
      toast.error(isAr ? "فشل التعديل" : "Failed to edit message");
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  const renderMessageContent = (msg) => {
    const isImage =
      msg.fileType?.startsWith("image/") ||
      (msg.file &&
        typeof msg.file === "string" &&
        msg.file.match(/\.(jpeg|jpg|gif|png|webp)/i)) ||
      (msg.file &&
        typeof msg.file === "string" &&
        msg.file.startsWith("data:image/"));

    const isVideo =
      msg.fileType?.startsWith("video/") ||
      (msg.file &&
        typeof msg.file === "string" &&
        msg.file.match(/\.(mp4|webm|ogg)/i)) ||
      (msg.file &&
        typeof msg.file === "string" &&
        msg.file.startsWith("data:video/"));

    return (
      <div className="space-y-2">
        {msg.file && (
          <div className="overflow-hidden rounded-xl bg-black/5 p-1">
            {isImage ? (
              <img
                src={msg.file}
                alt="Attachment"
                className="max-h-56 max-w-full rounded-lg object-contain cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(msg.file, "_blank")}
              />
            ) : isVideo ? (
              <video
                src={msg.file}
                controls
                className="max-h-56 max-w-full rounded-lg"
              />
            ) : (
              <a
                href={msg.file}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2 text-xs font-bold text-emerald-700 hover:underline"
              >
                <FileText size={16} />
                <span className="truncate">
                  {msg.fileName || "View Attachment"}
                </span>
              </a>
            )}
          </div>
        )}
        {msg.text && (
          <p className="font-medium whitespace-pre-wrap leading-relaxed text-xs">
            {msg.text}
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />
        <h2 className="text-sm font-bold text-gray-500">
          {isAr ? "جاري تحميل المحادثات..." : "Loading chats..."}
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-xs font-bold text-rose-600 text-start">
        {error}
      </div>
    );
  }

  return (
    <div
      className="w-full text-start overflow-hidden"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* WhatsApp-style split layout */}
      <div className="flex h-[calc(100vh-120px)] rounded-2xl border border-gray-200/70 bg-white shadow-xs overflow-hidden">

        {/* ===== LEFT SIDEBAR: Chat List ===== */}
        <div
          className={`flex flex-col border-e border-gray-200/70 bg-white ${
            selectedComplaint ? "hidden md:flex" : "flex"
          } w-full md:w-[380px] shrink-0`}
        >
          {/* Sidebar Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-white shrink-0">
            <h1 className="text-base font-black text-gray-900 mb-2">
              {t.title}
            </h1>
            {/* Search */}
            <div className="relative">
              <Search className="absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full rounded-xl border border-gray-200/80 bg-gray-50 ps-9 pe-3 py-2 text-xs font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>
            {/* Filter pills */}
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-0.5">
              {[
                { value: "all", label: t.allStatuses, count: totalComplaints },
                { value: "OPEN", label: t.pending, count: openComplaints },
                { value: "REPLIED", label: t.replied, count: repliedComplaints },
                { value: "CLOSED", label: t.closed, count: closedComplaints },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    statusFilter === f.value
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredComplaints.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <MessageSquare size={28} className="text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-400">
                  {t.noSearchResults}
                </p>
              </div>
            ) : (
              filteredComplaints.map((item) => {
                const clientName =
                  item.customerName || item.clientName || "Anonymous";
                const clientEmail = item.email || item.clientEmail || "";
                const lastMsg =
                  item.messages?.[item.messages.length - 1]?.text || "";
                const lastMsgSender =
                  item.messages?.[item.messages.length - 1]?.sender || "";
                const isActive = selectedComplaint?.id === item.id;
                const hasUnread =
                  item.hasNotification || item.unreadCount > 0;
                const lastTime = item.messages?.[item.messages.length - 1]?.time || "";

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedComplaint(item);
                      setReply("");
                      setAttachedFile(null);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b border-gray-50 ${
                      isActive
                        ? "bg-emerald-50 border-s-2 border-s-emerald-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={
                          item.avatar ||
                          "https://i.pravatar.cc/150?img=12"
                        }
                        alt={clientName}
                        className="w-11 h-11 rounded-full object-cover border border-gray-100"
                      />
                      {hasUnread && (
                        <span className="absolute -top-0.5 -end-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className={`text-xs truncate ${
                            hasUnread
                              ? "font-black text-gray-900"
                              : "font-bold text-gray-700"
                          }`}
                        >
                          {clientName}
                        </h3>
                        <span className="text-[9px] font-medium text-gray-400 shrink-0">
                          {lastTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p
                          className={`text-[11px] truncate ${
                            hasUnread
                              ? "font-bold text-gray-800"
                              : "font-medium text-gray-400"
                          }`}
                        >
                          {lastMsgSender === "admin"
                            ? `${isAr ? "أنت:" : "You:"} ${lastMsg}`
                            : lastMsg}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              item.status === "OPEN"
                                ? "bg-blue-100 text-blue-600"
                                : item.status === "REPLIED"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {item.status === "OPEN"
                              ? t.pending
                              : item.status === "REPLIED"
                              ? t.replied
                              : t.closed}
                          </span>
                          {hasUnread && (
                            <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1">
                              {item.unreadCount > 9 ? "9+" : item.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ===== RIGHT: Chat View ===== */}
        {selectedComplaint ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <div className="bg-linear-to-r from-green-600 to-emerald-500 px-3 sm:px-4 py-2.5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {/* Back button (mobile) */}
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="md:hidden p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
                >
                  <ArrowLeft size={18} />
                </button>
                <img
                  src={
                    selectedComplaint.avatar ||
                    "https://i.pravatar.cc/150?img=12"
                  }
                  alt={selectedComplaint.customerName || selectedComplaint.clientName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
                />
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm tracking-wide">
                    {selectedComplaint.customerName ||
                      selectedComplaint.clientName ||
                      "Client"}
                  </h4>
                  <p className="text-[10px] text-emerald-100/90 font-medium">
                    {selectedComplaint.email ||
                      selectedComplaint.clientEmail ||
                      t.onlineText}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedComplaint.status}
                  onChange={async (e) => {
                    const status = e.target.value;
                    try {
                      await changeStatus(selectedComplaint.id, status);
                      setSelectedComplaint({ ...selectedComplaint, status });
                      toast.success(t.statusSuccess);
                    } catch (err) {
                      toast.error(err.message);
                    }
                  }}
                  className="bg-black/20 text-white text-[10px] font-extrabold px-2 py-1 rounded-lg border border-white/20 outline-none cursor-pointer"
                >
                  <option value="OPEN" className="text-gray-900">
                    {t.pending}
                  </option>
                  <option value="REPLIED" className="text-gray-900">
                    {t.replied}
                  </option>
                  <option value="CLOSED" className="text-gray-900">
                    {t.closed}
                  </option>
                </select>

                <button
                  onClick={() => setDeleteId(selectedComplaint.id)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title={t.closeTicket}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div
              className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#efeae2] space-y-3 flex flex-col"
              style={{
                backgroundImage:
                  "radial-gradient(#000000 0.5px, transparent 0.5px)",
                backgroundSize: "16px 16px",
              }}
            >
              {selectedComplaint.messages &&
              selectedComplaint.messages.length > 0 ? (
                selectedComplaint.messages.map((msg, i) => {
                  const isUser =
                    msg.sender === "user" || msg.sender === "client";
                  const isAdmin = msg.sender === "admin";
                  const isEditingMsg = editingMsgId === String(msg.id);
                  const msgId = String(msg.id);

                  // Admin can only edit within 5 minutes
                  const msgAge = msg.createdAt
                    ? Date.now() - new Date(msg.createdAt).getTime()
                    : Infinity;
                  const canEditAdmin = isAdmin && msgAge < 5 * 60 * 1000;

                  return (
                    <div
                      key={msg.id || i}
                      className={`flex ${
                        isUser ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div className="max-w-[85%] sm:max-w-[65%] space-y-1">
                        {isEditingMsg ? (
                          <div className="flex gap-1.5 items-center bg-white p-1.5 rounded-xl shadow-sm border border-gray-200">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editingMsgText}
                              onChange={(e) =>
                                setEditingMsgText(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleEditMessage(msgId);
                                if (e.key === "Escape") {
                                  setEditingMsgId(null);
                                  setEditingMsgText("");
                                }
                              }}
                              className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleEditMessage(msgId)}
                              className="bg-green-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer"
                            >
                              {t.save}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMsgId(null);
                                setEditingMsgText("");
                              }}
                              className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed shadow-3xs ${
                                isUser
                                  ? "bg-white text-gray-800 rounded-tl-none border border-gray-200/50 whitespace-pre-line"
                                  : "bg-[#dcf8c6] text-gray-800 rounded-tr-none ml-auto whitespace-pre-line"
                              }`}
                            >
                              {/* Show sender name for admin (multiple admins) */}
                              {isAdmin && msg.senderName && (
                                <span className="block text-[9px] font-black mb-1 text-emerald-700">
                                  {msg.senderName}
                                </span>
                              )}
                              {renderMessageContent(msg)}
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <span className="text-[9px] font-bold text-gray-400">
                                  {msg.createdAt
                                    ? new Date(msg.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", { month: "short", day: "numeric" }) +
                                      " " +
                                      new Date(msg.createdAt).toLocaleTimeString(isAr ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" })
                                    : msg.time}
                                </span>
                              </div>
                            </div>
                            {/* Edit button — only if within 5 min for admin */}
                            {canEditAdmin && !isEditingMsg && (
                              <div
                                className={`flex gap-2.5 text-[9px] text-gray-500 font-bold px-1 ${
                                  isUser ? "justify-start" : "justify-end"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMsgId(msgId);
                                    setEditingMsgText(msg.text || "");
                                  }}
                                  className="hover:text-blue-600 flex items-center gap-0.5 transition-colors cursor-pointer"
                                >
                                  <Edit2 size={9} />
                                  {t.edit}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-400 shadow-xs">
                    <MessageSquare size={18} />
                  </div>
                  <p className="text-xs font-bold text-gray-500">
                    {t.noMessagesYet}
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attached File Preview */}
            {attachedFile && (
              <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 flex justify-between items-center text-xs text-gray-600 shrink-0">
                <span className="truncate flex items-center gap-1.5 font-bold">
                  📎 {attachedFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="text-rose-500 hover:text-rose-700 p-1 rounded-full hover:bg-gray-200 transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Input Area */}
            <form
              onSubmit={handleReply}
              className="p-2.5 sm:p-3 bg-white border-t border-gray-200 flex gap-2 items-center shrink-0"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
                title="Attach File"
              >
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                placeholder={t.replyPlaceholder}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={handleChatKeyDown}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-xs outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/5 transition-all"
              />

              <button
                type="submit"
                className="bg-green-600 text-white p-2.5 sm:p-3 rounded-full hover:bg-green-700 transition-all shadow-xs flex items-center justify-center shrink-0 w-9 h-9 sm:w-11 sm:h-11 cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        ) : (
          /* Empty state when no chat is selected */
          <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50/50 text-center p-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">
              {isAr ? "اختر محادثة" : "Select a chat"}
            </h3>
            <p className="text-[11px] text-gray-400 max-w-[240px]">
              {isAr
                ? "اختر محادثة من القائمة لبدء المراسلة"
                : "Choose a conversation from the list to start messaging"}
            </p>
          </div>
        )}
      </div>

      {/* ================= Close Confirmation Modal ================= */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <X size={24} />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">
                {t.closeTicket}
              </h2>
              <p className="mt-1 text-xs font-medium text-gray-500 leading-relaxed">
                {t.closeTicketText}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-orange-700 transition cursor-pointer"
              >
                {t.closeTicket}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
