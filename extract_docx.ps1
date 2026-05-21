Add-Type -AssemblyName 'System.IO.Compression.FileSystem'
$docxPath = 'C:\Users\Janice\Downloads\TurfBook_UseCase_Specification.docx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
foreach ($entry in $zip.Entries) {
    if ($entry.Name -eq 'document.xml') {
        $stream = $entry.Open()
        $reader = New-Object System.IO.StreamReader($stream)
        $content = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
        $text = [System.Text.RegularExpressions.Regex]::Replace($content, '<[^>]+>', ' ')
        $text = [System.Text.RegularExpressions.Regex]::Replace($text, '\s+', ' ')
        Write-Output $text.Trim()
    }
}
$zip.Dispose()
