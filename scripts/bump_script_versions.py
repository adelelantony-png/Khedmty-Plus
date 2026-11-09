file_path = r'public/servant-dashboard.html'
with open(file_path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('?v=7.8', '?v=8.0')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated ?v=7.8 to ?v=8.0 in servant-dashboard.html')
