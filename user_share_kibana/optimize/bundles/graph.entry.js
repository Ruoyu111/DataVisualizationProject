
/**
 * Test entry file
 *
 * This is programatically created and updated, do not modify
 *
 * context: {"env":"production","urlBasePath":"","sourceMaps":false,"kbnVersion":"5.3.0","buildNum":14823}
 * includes code from:
 *  - console@kibana
 *  - elasticsearch@kibana
 *  - graph@5.3.0
 *  - kbn_doc_views@kibana
 *  - kbn_vislib_vis_types@kibana
 *  - kibana@kibana
 *  - markdown_vis@kibana
 *  - metric_vis@kibana
 *  - monitoring@5.3.0
 *  - reporting@5.3.0
 *  - searchprofiler@5.3.0
 *  - security@5.3.0
 *  - spy_modes@kibana
 *  - status_page@kibana
 *  - table_vis@kibana
 *  - tagcloud@kibana
 *  - tilemap@5.3.0
 *  - timelion@kibana
 *  - xpack_main@5.3.0
 *
 */

require('ui/chrome');
require('plugins/graph/app_with_autoload');
require('plugins/security/views/nav_control');
require('plugins/xpack_main/hacks/check_xpack_info_change');
require('plugins/graph/hacks/toggle_app_link_in_nav');
require('plugins/monitoring/hacks/phone_home_notifications');
require('plugins/monitoring/hacks/phone_home_trigger');
require('plugins/monitoring/hacks/toggle_app_link_in_nav');
require('plugins/reporting/hacks/job_completion_notifier');
require('plugins/security/hacks/on_session_timeout');
require('plugins/security/hacks/on_unauthorized_response');
require('plugins/searchprofiler/register');
require('plugins/console/hacks/register');
require('plugins/kibana/dev_tools/hacks/hide_empty_tools');
require('plugins/timelion/lib/panel_registry');
require('plugins/timelion/panels/timechart/timechart');
require('ui/chrome').bootstrap(/* xoxo */);

