require 'fileutils'

if ARGV.empty?
  puts "Usage: ruby generate_exports.rb <directory_path>"
  exit 1
end

directory_path = ARGV[0]

unless Dir.exist?(directory_path)
  puts "Error: Directory '#{directory_path}' does not exist."
  exit 1
end

begin
  # Export all .ts / .tsx files except for index.ts.
  files = Dir.entries(directory_path)
    .select { |file| file =~ /\.(ts|tsx)$/ && file != 'index.ts' }
    .map { |file| File.basename(file, '.*') }

  # Export all subfolders that have an index.ts file.
  folders = Dir.entries(directory_path)
    .select { |entry|
      full_path = File.join(directory_path, entry)
      File.directory?(full_path) &&
        !['.', '..', '__tests__'].include?(entry) &&
        File.exist?(File.join(full_path, 'index.ts'))
    }

  exports = (files + folders).uniq.sort.map do |name|
    "export * from './#{name}'"
  end.join("\n")

  exports += "\n"

  File.write(File.join(directory_path, 'index.ts'), exports)
  puts "✅ index.ts generated at #{directory_path} including files and folders."

rescue => e
  puts "❌ Error: #{e.message}"
end
