interface QuickAction {
  icon: string;
  title: string;
  subtitle: string;
}

const actions: QuickAction[] = [
  { icon: "📋", title: "Parse a notice", subtitle: "Upload a school newsletter or notice" },
  { icon: "🍽️", title: "Meal plan", subtitle: "Create a weekly meal plan" },
  { icon: "💰", title: "Budget", subtitle: "Set up a household budget" },
  { icon: "🎁", title: "Gifts & birthdays", subtitle: "Track birthdays and gift ideas" },
  { icon: "👕", title: "Laundry schedule", subtitle: "Organise household laundry" },
  { icon: "🐾", title: "Pet care", subtitle: "Manage pet schedules and vet visits" },
  { icon: "📅", title: "Weekly schedule", subtitle: "Build a family weekly schedule" },
  { icon: "🏠", title: "Home maintenance", subtitle: "Seasonal home care checklist" },
  { icon: "🚗", title: "Vehicle admin", subtitle: "WoF, rego, and servicing tracker" },
];

interface Props {
  onSelect: (message: string) => void;
}

const HelmQuickActions = ({ onSelect }: Props) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full max-w-xl mt-4">
    {actions.map((a) => (
      <button
        key={a.title}
        onClick={() => onSelect(a.title)}
        className="text-left px-3.5 py-3 rounded-xl transition-all duration-200 group"
        style={{
          background: "#B388FF08",
          border: "1px solid #B388FF12",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "#B388FF30";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "#B388FF12";
        }}
      >
        <span className="text-2xl leading-none">{a.icon}</span>
        <p className="text-[13px] font-semibold text-foreground mt-1.5">{a.title}</p>
        <p className="text-[10.5px]" style={{ color: "#ffffff30" }}>{a.subtitle}</p>
      </button>
    ))}
  </div>
);

export default HelmQuickActions;
