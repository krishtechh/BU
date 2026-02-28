/**
 * updateDeptCategories.js
 * Run ONCE after the prisma migration: node prisma/updateDeptCategories.js
 * - Assigns all subcategories to the correct existing departments
 * - Creates the new "Urban Utilities" department for Utility Services
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEPT_CATEGORIES = [
  {
    code: 'ROAD',
    categories: [
      'road_pothole_filling',
      'road_resurfacing',
      'road_divider_repair',
      'road_footpath_repair',
      'road_speed_breaker',
    ],
  },
  {
    code: 'WATER',
    categories: [
      // Water Leaks & Supply
      'water_pipe_leak',
      'water_supply_restoration',
      'water_valve_replacement',
      'water_meter_issues',
      'water_borewell',
      // Drainage
      'drain_blockage',
      'drain_stormwater',
      'drain_manhole',
      'drain_sewage_overflow',
      'drain_pipe_repair',
      // Sanitation
      'san_public_toilet',
      'san_open_defecation',
      'san_sewage_treatment',
      'san_solid_waste',
      'san_street_sweeping',
      'san_dead_animal',
      'san_hospital_waste',
      'san_drain_cleaning',
      'san_graffiti',
      'san_toilet_block',
    ],
  },
  {
    code: 'POWER',
    categories: [
      // Electricity
      'elec_power_outage',
      'elec_transformer',
      'elec_broken_wires',
      'elec_meter',
      'elec_illegal',
      // Streetlight Failure
      'light_bulb_replacement',
      'light_wiring_fault',
      'light_pole_damage',
      'light_timer_fault',
      'light_solar',
    ],
  },
  {
    code: 'WASTE',
    categories: [
      'garbage_household',
      'garbage_bulk',
      'garbage_construction',
      'garbage_hazardous',
      'garbage_green',
    ],
  },
];

const NEW_DEPT = {
  name: 'Urban Utilities',
  code: 'UTIL',
  description: 'Handles gas pipelines, broadband, cable, telephone poles, WiFi, optical fiber, and underground utility infrastructure.',
  categories: [
    'util_gas_pipeline',
    'util_broadband',
    'util_cable_tv',
    'util_telephone_pole',
    'util_public_wifi',
    'util_gas_meter',
    'util_water_network',
    'util_optical_fiber',
    'util_junction_box',
    'util_underground',
  ],
};

async function main() {
  console.log('🔄 Updating department categories...\n');

  // Update existing departments
  for (const dept of DEPT_CATEGORIES) {
    const updated = await prisma.department.update({
      where: { code: dept.code },
      data: { categories: dept.categories },
    });
    console.log(`  ✅ ${updated.name} (${dept.code}) → ${dept.categories.length} subcategories assigned`);
  }

  // Create or update Urban Utilities
  const util = await prisma.department.upsert({
    where: { code: NEW_DEPT.code },
    update: { categories: NEW_DEPT.categories },
    create: NEW_DEPT,
  });
  console.log(`  ✅ ${util.name} (UTIL) → ${NEW_DEPT.categories.length} subcategories assigned`);

  console.log('\n🎉 All departments updated successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
