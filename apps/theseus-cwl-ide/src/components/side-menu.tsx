import { observer } from "mobx-react";
import { useState } from "react";

export enum SidebarSection {
  EXPLORER = "EXPLORER",
  SEARCH = "SEARCH",
  NONE = "NONE",
  RUN = "RUN",
}

export type CwlIdeSidebarProps = {
  setSideMenuSection: (section: SidebarSection) => void;
};

export const CwlIdeSideMenu = observer((props: CwlIdeSidebarProps) => {
  const { setSideMenuSection } = props;

  const [currentSection, setCurrentSection] = useState<SidebarSection>(
    SidebarSection.NONE,
  );

  const toggleSection = (section: SidebarSection) => {
    if (section === currentSection) {
      setCurrentSection(SidebarSection.NONE);
      setSideMenuSection(SidebarSection.NONE);
    } else {
      setCurrentSection(section);
      setSideMenuSection(section);
    }
  };

  const sidebarItems: Array<{
    icon: string;
    section: SidebarSection;
    onClick: () => void;
  }> = [
    {
      icon: "📁",
      section: SidebarSection.EXPLORER,
      onClick: () => toggleSection(SidebarSection.EXPLORER),
    },
    {
      icon: "🚀",
      section: SidebarSection.RUN,
      onClick: () => toggleSection(SidebarSection.RUN),
    },
    {
      icon: "🔍",
      section: SidebarSection.SEARCH,
      onClick: () => toggleSection(SidebarSection.SEARCH),
    },
  ];

  return (
    <div className="cwl-ide-side-menu">
      {sidebarItems.map((item, index) => {
        const { section, onClick, icon } = item;
        return (
          <button
            key={index}
            className={`side-menu-icon ${currentSection === section ? "active" : ""}`}
            onClick={onClick}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
});
