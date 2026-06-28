Pod::Spec.new do |s|
  s.name           = 'SharedDefaults'
  s.version        = '1.0.0'
  s.summary        = 'App Group UserDefaults bridge for Router Island.'
  s.description    = 'Reads and writes App Group UserDefaults shared with the Live Activity widget and Siri App Intent.'
  s.author         = 'Router Island'
  s.homepage       = 'https://github.com/aitorru/router-island'
  s.license        = { :type => 'MIT' }
  s.platforms      = { :ios => '16.2' }
  s.source         = { :git => '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
