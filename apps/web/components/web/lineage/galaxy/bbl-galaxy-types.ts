export type BblGalaxyRole = "ROOT_STAR" | "LEGEND_STAR" | "INSTRUCTOR_PLANET" | "STUDENT_MOON";

export type BblVerifiedStatus = "VERIFIED";

export type BblRelationshipType = "PRIMARY_LINEAGE" | "PROMOTED_BY" | "TRAINED_UNDER";

export type BblDiscipline = "BJJ";

export type BblGalaxyNode = {
  id: string;
  displayName: string;
  initials: string;
  slug: string;
  role: BblGalaxyRole;
  discipline: BblDiscipline;
  rankLabel?: string;
  title?: string;
  photoUrl?: string;
  verifiedStatus: BblVerifiedStatus;

  /**
   * Generation controls distance from the center.
   * 0 = root / major anchor
   * 1 = first orbit
   * 2 = second orbit
   * 3 = moons / students
   */
  generation: number;

  /**
   * Used to place nodes around orbital bands.
   */
  orbitIndex: number;
  orbitTotal: number;

  /**
   * Cohort/group label for timeline bands and constellations.
   */
  groupId?: string;
  groupLabel?: string;

  /**
   * Optional timeline year for story mode later.
   */
  timelineYear?: number;

  /**
   * Size multiplier. If omitted, role decides size.
   */
  size?: number;
};

export type BblGalaxyEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: BblRelationshipType;
  verifiedStatus: BblVerifiedStatus;
  groupId?: string;
};

export type BblGalaxyGroup = {
  id: string;
  label: string;
  kind: "LINEAGE_BRANCH" | "PROMOTION_COHORT" | "TIMELINE_BAND";
  generation: number;
  color: string;
};

export type BblGalaxyPosition = {
  id: string;
  x: number;
  y: number;
  z: number;
};

export type BblGalaxyGraph = {
  nodes: BblGalaxyNode[];
  edges: BblGalaxyEdge[];
  groups: BblGalaxyGroup[];
};

export type BblGalaxySelectedNode = BblGalaxyNode | null;
